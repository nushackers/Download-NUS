var config = require("./config");

var express = require('express'),
    app = express(),
    port = config.app.port,
    Router = require('./lib/ServerRouter'),
    ApiClient = require('./lib/server_api_client'),
    connect = require("connect"),
    RedisStore = require("connect-redis")(connect);

// Allow directly requiring '.jsx' files.
require('node-jsx').install({extension: '.jsx'});

var sessionStore = new RedisStore(config.redisStore.option);

app.use(express.compress());
app.use(express.static(__dirname + '/static'), { maxAge: config.app.cacheDuration });

app.use(express.bodyParser());

app.use(express.cookieParser(config.session.secret));
app.use(express.session({ secret:config.session.secret, store: sessionStore }));
var api = require('./lib/api')(app, "/api", config),
    apiClient = ApiClient(api),
    routes = require('./app/routes')(apiClient, config.app.insecure),
    router = new Router(routes);

// Use the router as a middleware.
app.use(router.middleware);

app.listen(port);

console.log('Running on port %s', port);
