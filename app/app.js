var util = require('util');

try {
    var config = require('./config');
} catch (e) {
    console.error('error reading config.json!');
    console.error('place config.json in app directory');
    console.error('see: config.json.example for example');
    process.exit(1);
}


// hack
process.env.TMPDIR = config.fs.tmpDir;

var _ = require('underscore');
var Q = require('q');
var ejs = require('ejs');
var express = require('express');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var passport = require('passport');
var truncate = require('truncate-component');
var marked = require("marked");

marked.setOptions({
    gfm: true,
    highlight: function (code, lang, callback) {
        return code;
    },
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    langPrefix: 'lang-'
});

var NusStrategy = require('./passport-nus').Strategy;

var dataAccess = require("./Data")(config.db, config.fs, config.date.format);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new NusStrategy(function(profile, done) {
    dataAccess.User.findOrCreate({ nusId: profile.name }, {
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

    dataAccess.performSearch(search, offset)
        .then(trancate)
        .then(appendUserInfo(req))
        .done(function(data){
            res.render('search.ejs', _.extend({
                page: page
            }, data));
        });
});

app.get('/data', function(req, res) {
    var page = req.query.page || 1;
    var offset = (page-1)*10;
    
    var where = {};
    
    if (req.query.cat) where.DataCategoryId = req.query.cat;
    if (req.query.type) where.DataTypeId = req.query.type;

    dataAccess.getDatasets(where, offset, page)
        .then(trancate)
        .then(appendUserInfo(req))
        .done(function(data){
            res.render('data.ejs', _.extend({
                page: page
            }, data));
        });
});

app.get('/manage', function(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
        return;
    }

    dataAccess.getUserDatasets(req.session.passport.user.nusId)
        .then(appendUserInfo(req))
        .done(function(data){
            res.render('manageData.ejs', data);
        });
});

app.get('/api', function(req, res) {
    res.render('api.ejs', { user:req.user });
});

function renderUpload(req, res, form){
    dataAccess.getAllMetaData()
        .then(appendUserInfo(req))
        .done(function(data){
            res.render("upload.ejs", _.extend({
                form: form,
                messages:req.flash('error')
            }, data));
        });
}
app.get('/upload', function(req, res) {
    if (!req.isAuthenticated()) {
		res.redirect('/login');
		return;
	}
    
    renderUpload(req, res, {});
});

app.post('/upload', ensureLoggedIn('/login'), function(req, res) {
    var name = req.body.name;
    var description = req.body.description;
    var categoryId = req.body.categoryId;
    var typeId = req.body.typeId;
    var file = req.files.file;
    var userId = req.user.id;

    var form = {
        name:name,
        description:description,
        categoryId:categoryId,
        typeId:typeId
    };
    
    req.onValidationError(function (err) {
        req.flash('error', err);
        renderUpload(req, res, form);
    });
    
    req.check('name', 'Please enter a valid name').len(3, 255);
    req.check('categoryId', 'Invalid categeoryId').isInt();
    req.check('typeId', 'Invalid typeId').isInt();
    
    req.sanitize('name').trim();
    req.sanitize('description').xss();

    dataAccess.uploadDataset(file, userId, categoryId, typeId, name, description).then(function(){
        res.redirect("/data");
    }, function(err){
        if(err.fileTypeReject){
            req.flash('error', 'File type is not allowed.');
            renderUpload(req, res, form);
        } else {
            res.send(500);
        }
    });
});

app.get("/data/:id", function(req, res){
    var isEdit = ("edit" in req.query);
    if(isEdit){
        if (!req.isAuthenticated()) {
            res.redirect('/login');
            return;
        }
    }

    var id = req.param("id");
    if(isNaN(id)){
        res.send(404);
    }else{
        id = parseInt(id, 10);
        var action = isEdit ? dataAccess.getDataWithId(id) : dataAccess.getDisplayDataWithId(id);
        action.done(function(data){
            if(!data){
                res.send(404);
            }else if(isEdit && data.UserId !== req.user.id){
                res.send(401);
            }else{
                data.categoryId = data.DataCategoryId;
                data.typeId = data.DataTypeId;
                if(isEdit) {
                    renderUpload(req, res, data);
                } else {
                    res.render("displayData.ejs", {
                        form: toMarkdown(data),
                        messages:req.flash('error'),
                        user: req.user
                    });
                }
            }
        });
    }
});

app.del("/data/:id", function(req, res){
    if (!req.isAuthenticated()) {
        res.redirect('/login');
        return;
    }

    var id = req.param("id");
    if(isNaN(id)){
        res.send(404);
    }else{
        id = parseInt(id, 10);
        dataAccess.deleteDataset(id, req.user.id).then(function(){
            res.send("success");
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


app.post("/data/:id", function(req, res){
    if (!req.isAuthenticated()) {
        res.redirect('/login');
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
        var file = req.files.file;
        var userId = req.user.id;

        var form = {
            id: id,
            name:name,
            description:description,
            categoryId:categoryId,
            typeId:typeId
        };

        req.onValidationError(function (err) {
            req.flash('error', err);
            renderUpload(req, res, form);
        });
        
        req.check('name', 'Please enter a valid name').len(3, 255);
        req.check('categoryId', 'Invalid categeoryId').isInt();
        req.check('typeId', 'Invalid typeId').isInt();
        
        req.sanitize('name').trim();
        req.sanitize('description').xss();

        dataAccess.updateDataset({
            id: id,
            name: name,
            description: description,
            categoryId: categoryId,
            typeId: typeId,
            file: file,
            userId: req.user.id
        }).then(function(data){
            res.redirect("/data/" + id);
        }, function(err){
            console.log(err);
            if(err.fileTypeReject){
                req.flash('error', 'File type is not allowed.');
                renderUpload(req, res, form);
            } else if (err.notAuthorized){
                res.send(401);
            } else {
                res.send(500);
            }
        });
    }
});

app.get('/login', function(req, res){
    if (req.isAuthenticated()) {
		res.redirect('/');
		return;
    }

    if (!config.app.insecure && req.header('x-forwarded-proto') !== "https"){
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

function appendUserInfo(req){
    return function(data){
        return _.extend({
            user: req.user
        }, data);
    };
}

function stripMarkdown(str){
    return str.split(/#|_|\*|\n/g).join("");
}

function trancate(data){
    data.datasets.forEach(function(d){
        d.description = truncate(stripMarkdown(d.description), 30, ' ...');
    });
    return data;
}

function toMarkdown(dataset){
    dataset.description = marked(dataset.description);
    return dataset;
}