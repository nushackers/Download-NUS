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


module.exports = function(app, prefix, config){
    var dataAccess = require("./Data")(config.db, config.fs, config.date.format);
    var passport = require('passport');

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

    app.use(passport.initialize());
    app.use(passport.session({ cookie: { maxAge:config.session.maxAge } }));

    var addRoute = function(method, route, callback){
        app[method](prefix + route, callback);
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
            // if (search.length < 3) {
            //     res.send({
            //         error: {
            //             title: 'Keywords too short',
            //             description: 'Search keyword must be longer than 2 characters'
            //         }
            //     });
            //     return;
            // }

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
