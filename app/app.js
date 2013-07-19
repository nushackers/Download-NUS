var util = require('util');
var fs = require('fs');

if (!fs.existsSync('./config.json')) {
    console.error('config.json not found!');
    console.error('place config.json in app directory');
    console.error('see: config.json.example for example');
    process.exit(1);
}

var config = require('./config.json');

var express = require('express');
var mysql = require('mysql');
var passport = require('passport');
var NusStrategy = require('./passport-nusauth.js').Strategy;

var connection = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.pass,
    database: config.db.database,
    port: config.db.port
});

connection.connect();

passport.serializeUser(function(user, done) {
    //TODO: serialize user
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    // TODO: deserialize user
    done(null, user);
});

passport.use(new NusStrategy(config.auth, function(profile, done) {
    // TODO: verify profile
    return done(null, profile);
}));

var app = express();

app.configure(function() {
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.cookieParser(config.session.secret));
    app.use(express.session({
        secret: config.session.secret
    }));
    app.use(passport.initialize());
    app.use(passport.session({
        cookie: {
            maxAge: config.session.maxAge
        }
    }));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use("/", express.static(__dirname + '/../static'));
    app.use(function(err, req, res, next) {
        if (config.app.debug) {
            console.error('(EE) [app] ' + err.stack);
            res.send({
                error: err.message
            });
        } else {
            res.send(500);
        }
    });
});

app.listen(config.app.port, config.app.ip);
if (config.app.debug) console.log('(II) [app] listening on port ' + config.app.port);

app.post('/api/login',
    passport.authenticate('nusauth'),
    function(req, res){
        res.send({
            success: true
        });
    });

app.get('/api/logout', function(req, res) {
    req.logout();
    res.send({
        success: true
    });
});

app.get('/api/profile', function(req, res) {
    if (!req.isAuthenticated()) {
        res.send({});
        return;
    }
    res.send(req.user);
});
