var _ = require("underscore"),
    truncate = require('truncate-component'),
    NusStrategy = require('./passport-nus').Strategy;

function truncateDatasets(data){
    data.datasets.forEach(function(d){
        d.description = truncate(stripMarkdown(d.description), 30, ' ...');
    });
    return data;
}

function stripMarkdown(str){
    return str.split(/#|_|\*|\n/g).join("");
}

    
module.exports = function(express, app, prefix, config, redis){
    var bigFileUpload = require("./bigFileUploadServer");
    var dataAccess = require("./Data")(config.db, config.fs, config.date.format);
    var passport = require('passport');

    bigFileUpload.checkMimeType = dataAccess.checkMimeType;

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use(new NusStrategy({
            usernameField: "nusId"
        },
        function(profile, done) {
            dataAccess.User.findOrCreate({ nusId: profile.name }, {
                name: profile.displayName
            }).success(function(user, created){
                done(null, user);
            }).failure(function(err){
                done(null, false);
            });
        }));

    var expressValidator = require('express-validator');
    app.use(expressValidator());
    app.use(passport.initialize());
    app.use(passport.session({ cookie: { maxAge:config.session.maxAge } }));

    var addRoute = function(method, route, middleware, callback){
        if(callback){
            app[method](prefix + route, middleware, callback);
        } else {
            app[method](prefix + route, middleware);
        }
    };

    addRoute('post', '/login', function(req, res){
        passport.authenticate('nus', function(err, user, info){
            if(err){
                res.send({
                    err: err
                });
            } else if(!user){
                res.send({
                    err: info.message
                });
            } else if(user.level == 0) {
                res.send({ 
                    err: "You have been banned. Please use the contact link at the footer if you think this is a mistake."
                });
            } else {
                req.logIn(user, function(err) {
                    if(err){
                        res.send({
                            err: err
                        });
                    } else {
                        res.send({
                            user: user
                        });
                    }
                });
            }
        })(req, res);
    });

    addRoute('get', '/datasets.json', function(req, res) {
        var page = req.query.page || 1;
        var offset = (page-1)*10;
        
        var search = req.query.q;

        console.log("datasets.json", req.query);

        if(search){
            if (search.length < 3) {
                res.send({
                    error: {
                        title: 'Keywords too short',
                        description: 'Search keyword must be longer than 2 characters'
                    }
                });
                return;
            }

            dataAccess.performSearch(search, offset)
            .then(truncateDatasets)
            .done(function(data){
                res.send(data);
            });
        } else if(req.query.user){
            dataAccess.getUserDatasets(req.query.user)
                .then(truncateDatasets)
                .done(function(data){
                    res.send(data);
                });
        } else {
            var where = {};
        
            if (req.query.cat) where.DataCategoryId = req.query.cat;
            if (req.query.type) where.DataTypeId = req.query.type;

            dataAccess.getDatasets(where, offset, page)
                .then(truncateDatasets)
                .done(function(data){
                    res.send(data);
                });
        }
    });

    addRoute('get', '/metadata.json', function(req, res){
        dataAccess.getAllMetaData().done(function(data){
            res.send(data);
        });
    });

    addRoute('get', "/login", function(req, res){
        req.session.loggedIn = req.param("user");
        res.send({
            success: true,
            user: req.session.loggedIn
        });
    });

    addRoute('get', "/datasets/:id", function(req, res){
        var id = req.param("id").split(".")[0];
        if(isNaN(id)){
            res.send({
                err: "not found"
            });
        }else{
            id = parseInt(id, 10);
            var action = dataAccess.getDisplayDataWithId(id);
            action.done(function(data){
                if(!data){
                    res.send({
                        err: "not found"
                    });
                }else{
                    data.categoryId = data.DataCategoryId;
                    data.typeId = data.DataTypeId;
                    res.send(data);
                }
            });
        }
    });

    addRoute('put', "/datasets/:id", function(req, res){
        if (!req.isAuthenticated()) {
            res.send(401);
            return;
        }

        var id = req.param("id");
        if(isNaN(id)){
            res.send(404);
        }else{
            id = parseInt(id, 10);
            var name = req.body.name;
            var description = req.body.description;
            var categoryId = req.body.categoryId;
            var typeId = req.body.typeId;
            var file = req.files && req.files.file;
            var userId = req.user.id;
            var fileTicket = req.body.ticket;

            var form = {
                id: id,
                name:name,
                description:description,
                categoryId:categoryId,
                typeId:typeId
            };
            
            req.check('name', 'Please enter a valid name').len(3, 255);
            req.check('categoryId', 'Invalid categeoryId').isInt();
            req.check('typeId', 'Invalid typeId').isInt();

            var err = req.validationErrors();
            if(err){
                res.send({
                    err: err
                });
            } else {
                req.sanitize('name').trim();
                req.sanitize('description').xss();

                var uploadFile;
                if(file && file.size){
                    uploadFile = file;
                } else {
                    uploadFile = bigFileUpload.getFile(userId, fileTicket);
                }
                console.log(uploadFile, "file");

                dataAccess.updateDataset({
                    id: id,
                    name: name,
                    description: description,
                    categoryId: categoryId,
                    typeId: typeId,
                    file: uploadFile,
                    userId: req.user.id
                }).then(function(data){
                    dataAccess.getDisplayDataWithId(data.id).done(function(data){
                        data.categoryId = data.DataCategoryId;
                        data.typeId = data.DataTypeId;
                        res.send(data);
                    }).fail(function(){
                        res.send(500);
                    });
                }, function(err){
                    console.log(err, "put dataset");
                    if(err.fileTypeReject){
                        res.send({
                            'err': 'File type is not allowed.'
                        });
                    } else if (err.notAuthorized){
                        res.send(401);
                    } else {
                        res.send(500);
                    }
                });
            }
        }
    });

    addRoute('del', "/datasets/:id", function(req, res){
        if (!req.isAuthenticated()) {
            res.send(401);
            return;
        }

        var id = req.param("id");
        if(isNaN(id)){
            res.send(404);
        }else{
            id = parseInt(id, 10);
            dataAccess.deleteDataset(id, req.user).then(function(){
                res.send({
                    success: true
                });
            }, function(err){
                console.log(err);
                if (err.notAuthorized){
                    res.send(401);
                } else {
                    res.send(500);
                }
            });
        }
    });

    addRoute('post', "/datasets", function(req, res){
        if (!req.isAuthenticated()) {
            res.send(401);
            return;
        }

        var file = req.files && req.files.file,
            fileTicket = req.body.ticket,
            onlyValidation = req.body.onlyValidation;

        req.check('name', 'Please enter a valid name').len(3, 255);
        req.check('description', 'Please enter some description').len(1, 1000);
        req.check('categoryId', 'Invalid categeoryId').isInt();
        req.check('typeId', 'Invalid typeId').isInt();

        var err = req.validationErrors() || [];
        if((!file || !file.size) && !fileTicket && !onlyValidation){
            err.push({ msg: "Please upload a file." });
        }
        if(err.length){
            res.send({
                err: err
            });
        } else if (onlyValidation) {
            res.send({
                success: true
            });
        } else {
            req.sanitize('name').trim();
            req.sanitize('description').xss();

            var name = req.body.name;
            var description = req.body.description;
            var categoryId = req.body.categoryId;
            var typeId = req.body.typeId;
            var filename = req.body.filename;
            var userId = req.user.id;

            var uploadFile;

            if(file && file.size){
                uploadFile = file;
            } else {
                uploadFile = bigFileUpload.getFile(userId, fileTicket);
            }
            if(!uploadFile){
                res.send({
                    err: "Invalid file."
                });
            } else {
                dataAccess.uploadDataset(uploadFile, userId, categoryId, typeId, name, description).then(function(data){
                    dataAccess.getDisplayDataWithId(data.id).done(function(data){
                        data.categoryId = data.DataCategoryId;
                        data.typeId = data.DataTypeId;
                        res.send(data);
                    }).fail(function(){
                        res.send(500);
                    });
                }, function(err){
                    if(err.fileTypeReject){
                        res.send({
                            err: 'File type is not allowed.'
                        });
                    } else {
                        res.send(500);
                    }
                });
            }
        }
    });

    addRoute('post', '/upload', function(req, res){
        if (!req.isAuthenticated()) {
            res.send(401);
            return;
        }
        var filename = req.body.filename,
            filesize = parseInt(req.body.filesize, 10);
        if(!filename || isNaN(filesize) || !filesize){
            res.send({
                err: "invalid data"
            });
        } else {
            bigFileUpload.setupUpload(req.user.id, filename, filesize, function(err, ticket){
                if(err){
                    res.send({
                        err: err
                    });
                } else {
                    res.send({
                        ticket: ticket
                    });
                }
            });
        }
    });

    addRoute('post', '/upload/:ticket/:seq', express.multipart({ limit: "250mb",  uploadDir: config.fs.tmpDir }), function(req, res){
        if (!req.isAuthenticated()) {
            res.send(401);
            return;
        }
        bigFileUpload.receiveChunk(req.user.id,
                                   req.param("ticket"),
                                   parseInt(req.param("seq"), 10),
                                   req.files.file,
            function(err, ack){
            if(err){
                res.send({
                    err: err
                });
            } else {
                res.send({
                    ack: ack
                });
            }
        });
    });

    addRoute('post', '/logout', function(req, res){
        req.logout();
        res.send({
            success: true
        });
    });

    app.callRoute = function(method, path, req, callback) {
        var fakeRes = {
            send: function(obj){
                callback(null, {body: obj});
            }
        };
        var route = app.getRoute(method, prefix + path);
        var handler;
        if(route) {
            // TODO: multiple callbacks?
            handler = route.callbacks[0];
        }
        if(handler){
            var p = req.param;
            req.param = function(key){
                var r = route.regexp.exec(prefix + path);
                for(var i = 0; i < route.keys.length; i++){
                    if(route.keys[i].name === key){
                        return r[i + 1];
                    }
                }
                return null;
            };
            try{
                handler(req, fakeRes);
                req.param = p;
            } catch(e){
                req.param = p;
                callback(e);
            }
        } else {
            callback("no such route " + path);
        }
    };

    app.getRoute = function(method, path){
        var paths = app.routes[method];
        return _.find(app.routes[method], function(p) { return p.regexp.test(path); });
    };

    return app;
};
