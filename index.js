var config = require("./config");

var express = require('express'),
    app = express(),
    port = config.app.port,
    apiPort = config.app.apiPort,
    routes = require('./app/routes'),
    Router = require('./app/router');

// Allow directly requiring '.jsx' files.
require('node-jsx').install({extension: '.jsx'});

app.use(express.static(__dirname + '/static'));

app.use(express.bodyParser());

app.use(express.cookieParser(config.session.secret));
app.use(express.session({ secret:config.session.secret }));
var api = require('./lib/api')(app, "/api", config),
    ApiClient = require("./lib/server_api_client"),
    router = new Router(routes, ApiClient(api));

// Use the router as a middleware.
app.use(router.middleware);

app.listen(port);

// Run the API server on a separate port, so we can make
// HTTP requests to it from within our main app.
api.listen(apiPort);

console.log('Running on port %s',
            port);