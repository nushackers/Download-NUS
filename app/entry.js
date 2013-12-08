/**
 * Entry point for client-side.
 */

var ClientRouter = require('./ClientRouter'),
    apiClient = require("./api_client"),
    routes = require('./routes')(apiClient),
    sessionManager = require('./sessionManager')(apiClient, window.initialSession),
    router = new ClientRouter(routes, sessionManager);

router.start();
