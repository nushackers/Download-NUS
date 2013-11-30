/**
 * Entry point for client-side.
 */

var Router = require('./router'),
    routes = require('./routes'),
    apiClient = require("./api_client"),
    router = new Router(routes, apiClient);

router.start();
