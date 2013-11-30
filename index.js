var config = require("./config");

var express = require('express'),
    app = express(),
    port = config.app.port,
    apiPort = config.app.apiPort,
    routes = require('./app/routes'),
    Router = require('./app/router'),
    ApiClient = require("./server_api_client"),
    router = new Router(routes, ApiClient(apiPort)),
    api = require('./lib/api');

// Allow directly requiring '.jsx' files.
require('node-jsx').install({extension: '.jsx'});

app.use(express.static(__dirname + '/static'));

// On the client, we want to be able to just send API requests to the
// main web server using a relative URL, so we proxy requests to the
// API server here.
app.use('/api', api.proxyMiddleware(apiPort));

// Use the router as a middleware.
app.use(router.middleware);

app.listen(port);

// Run the API server on a separate port, so we can make
// HTTP requests to it from within our main app.
api.listen(apiPort);

console.log('Running on port %s; API on port %s',
            port,
            apiPort);
