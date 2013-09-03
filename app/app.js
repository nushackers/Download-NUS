var fs = require('fs');
var util = require('util');
var path = require('path');

try {
    var config = require('./config');
} catch (e) {
    console.error('error reading config.json!');
    console.error('place config.json in app directory');
    console.error('see: config.json.example for example');
    process.exit(1);
}

var _ = require('underscore');
var Q = require('q');
var ejs = require('ejs');
var mmm = require('mmmagic');
var Magic = mmm.Magic;
var shortId = require('shortid');
var dateFormat = require('dateformat');
var express = require('express');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var passport = require('passport');
var Sequelize = require('sequelize');

var NusStrategy = require('./passport-nus').Strategy;

var sequelize = new Sequelize(config.db.database, config.db.user, config.db.pass, config.db.opt);

var Schema = sequelize.import(__dirname + '/schema.js');

var User = Schema.User;
var Dataset = Schema.Dataset;
var DataCategory = Schema.DataCategory;
var DataType = Schema.DataType;
var DataFile = Schema.DataFile;
    
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new NusStrategy(function(profile, done) {
    User.findOrCreate({ nusId: profile.name }, {
        name: profile.displayName
    }).success(function(user, created){
        done(null, user);
    }).failure(function(err){
        done(null, false);
    });
}));

var app = express();

app.configure(function() {
    // use middlewares
    app.use(flash());
    if (config.app.debug) {
        app.use(express.logger());
    }
    app.use(express.bodyParser());
    app.use(expressValidator());
    
    // set up passport sessions
    app.use(express.cookieParser(config.session.secret));
    app.use(express.session({ secret:config.session.secret }));
    app.use(passport.initialize());
    app.use(passport.session({ cookie: { maxAge:config.session.maxAge } }));
    
    // set up routes
    app.use(express.methodOverride());
    app.use(app.router);
    app.set('views', __dirname + '/../views');
    app.engine('html', ejs.renderFile);
    app.use(express.static(__dirname + '/../static'));
    app.use(function(err, req, res, next) {
        if (config.app.debug) {
            console.error(err.stack);
            res.send({
                error: err.message
            });
        } else {
            res.send(500);
        }
    });
});

app.listen(config.app.port, config.app.ip);
if (config.app.debug) console.log('listening on port ' + config.app.port);

app.get('/', function(req, res) {
    res.render('main.ejs', { user:req.user }); 
});

app.get('/search', function(req, res) {
    var page = req.query.page || 1;
    var offset = (page-1)*10;
    
    var search = req.query.q;
    
    if (search.length < 3) {
        res.render('search.ejs', {
            user: req.user,
            error: {
                title: 'Keywords too short',
                description: 'Search keyword must be longer than 2 characters'
            }
         });
        return;
    }
    
    Q.all([textSearchDatasets(search, 10, offset), getCount(Dataset), getAll(DataCategory), getAll(DataType)])
    .spread(function(datasets, datasetCount, categories, types) {
        var pages = Math.ceil(datasetCount / 10);
        res.render('search.ejs', {
            search: search,
            user: req.user,
            page: page,
            pages: pages,
            datasets: datasets,
            categories: categories,
            types: types
        });
    });
});

app.get('/data', function(req, res) {
    var page = req.query.page || 1;
    var offset = (page-1)*10;
    
    var where = {};
    
    if (req.query.cat) where.DataCategoryId = req.query.cat;
    if (req.query.type) where.DataTypeId = req.query.type;
    
    Q.all([getDatasets(where, 10, offset), getCount(Dataset), getAll(DataCategory), getAll(DataType)])
    .spread(function(datasets, datasetCount, categories, types) {
        var pages = Math.ceil(datasetCount / 10);
        res.render('data.ejs', {
            user: req.user,
            page: page,
            pages: pages,
            datasets: datasets,
            categories: categories,
            types: types
        });
    });
});

app.get('/api', function(req, res) {
    res.render('api.ejs', { user:req.user }); 
});

app.get('/upload', function(req, res) {
    if (!req.isAuthenticated()) {
		res.redirect('/login');
		return;
	}
    
    Q.all([getAll(DataCategory), getAll(DataType)])
    .spread(function(categories, types) {
        res.render('upload.ejs', { form:{}, user:req.user, categories:categories, types:types, messages:req.flash('error') });
    });
});

app.post('/upload', ensureLoggedIn('/login'), function(req, res) {
    var name = req.body.name;
    var description = req.body.description;
    var categoryId = req.body.categoryId;
    var typeId = req.body.typeId;
    var file = req.files.file;
    var userId = req.user.id;
    
    req.onValidationError(function (err) {
        req.flash('error', err); 
        return fail();
    });
    
    req.check('name', 'Please enter a valid name').len(3, 255);
    req.check('categoryId', 'Invalid categeoryId').isInt();
    req.check('typeId', 'Invalid typeId').isInt();
    
    req.sanitize('name').trim();
    req.sanitize('description').xss();
    
    Q.all([checkMimeType(file.path), generateShortId(), getById(User, userId), getById(DataCategory, categoryId), getById(DataType, typeId)])
    .spread(function(check, shortid, user, category, type) {
        if (!check) {
            req.flash('error', 'File type is not allowed.');
            return fail();
        }
        
        var path = config.fs.dir + shortid + '/';
        var data = fs.readFileSync(file.path);
        
        fs.mkdirSync(path);
        fs.writeFileSync(path + file.name, data);
        
        DataFile.create({ filepath: shortid + '/' + file.name })
        .success(function(datafile){
            var dataset = Dataset.create({
                shortId: shortid,
                name: name,
                description: description
            }).success(function(dataset) {
                dataset.setDataCategory(category);
                dataset.setDataType(type);
                dataset.setDataFiles([datafile]);
                dataset.setUser(user);
        
                dataset.save()
                .success(function() {
                    res.redirect('/');
                }).failure(function(err) {
                    res.send(500);
                });
            });
        });
    });
    
    function fail() {
        var form = {
            name:name,
            description:description,
            categoryId:categoryId,
            typeId:typeId
        };
        
        Q.all([getAll(DataCategory), getAll(DataType)])
        .spread(function(categories, types) {
            res.render('upload.ejs', { form:form, user:req.user, categories:categories, types:types, messages:req.flash('error') });
        });
    }
});

app.get('/login', function(req, res){
    if (req.isAuthenticated()) {
		res.redirect('/');
		return;
    }

    if (req.header['x-forwarded-proto'] !== "https"){
        res.redirect("https://" + req.headers.host + req.path);
        return;
    }
    
    res.render('login.ejs', { messages: req.flash('error') });
});

app.post('/login', passport.authenticate('nus', {
	successReturnToOrRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

function checkMimeType(file) {
    var deferred = Q.defer();
    var magic = new Magic(mmm.MAGIC_MIME_TYPE);
    magic.detectFile(file, function(err, mime) {
        if (err) {
            deferred.reject(new Error(err));
        }
        
        if (config.fs.mimeAllowed.indexOf(mime) != -1) {
            deferred.resolve(true);
        } else {
            deferred.resolve(false);
        }
    });
    return deferred.promise;
}

function getDatasets(where, n, offset) {
    where = where || {};
    n = n || 10;
    offset = offset || 0;
    
    var deferred = Q.defer();
    Dataset.findAll({ include:[ User, DataCategory, DataType, DataFile ], limit:n, offset:offset, where:where })
    .success(function(datasets) {
        datasets.forEach(function(dataset) {
            dataset.formatedUpdatedAt = dateFormat(dataset.updatedAt, config.date.format);
            dataset.formatedCreatedAt = dateFormat(dataset.createdAt, config.date.format);
            
            dataset.dataFiles.forEach(function(dataFile) {
                dataFile.extension = path.extname(dataFile.filepath).substr(1);
            });
        });
        deferred.resolve(datasets);
    })
    .failure(function(err) {
        deferred.reject(new Error(err));
    });
    return deferred.promise;
}

function textSearchDatasets(search, n, offset) {
    search = search || '';
    var where = 'MATCH (`Datasets`.`name`, `Datasets`.`description`) AGAINST ("' + search + '" IN BOOLEAN MODE)';
    return getDatasets(where, n, offset);
}

function getCount(Model) {
    var deferred = Q.defer();
    Model.count()
    .success(function(c){
        deferred.resolve(c);
    })
    .failure(function(err) {
        deferred.reject(new Error(err));
    });
    return deferred.promise;
}

function getAll(Model) {
    var deferred = Q.defer();
    Model.findAll()
    .success(function(x) {
        deferred.resolve(x);
    })
    .failure(function(err) {
        deferred.reject(new Error(err));
    });
    return deferred.promise;
}

function getById(Model, id) {
    var deferred = Q.defer();
    Model.find(id)
    .success(function(x) {
        deferred.resolve(x);
    })
    .failure(function(err) {
        deferred.reject(new Error(err));
    });
    return deferred.promise;
}

function generateShortId() {
    var deferred = Q.defer();
    var shortid = shortId.generate();
    Dataset.find({ where:{ shortId:shortid } })
    .success(function(dataset) {
        if (dataset == null) {
            deferred.resolve(shortid);
        } else {
            generateShortId()
            .then(function(shortId) {
                deferred.resolve(shortid);
            })
            .done();
        }
    });
    return deferred.promise;
}