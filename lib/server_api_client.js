/**
* Small wrapper around `superagent` module to make it easier to consume
* the API the same way on client & server.
*/
module.exports = function(apiApp){
    var client = {};
    /**
    * Proxy each method to `superagent`, formatting the URL.
    */
    ['get', 'post', 'put', 'path', 'del'].forEach(function(method) {
        client[method] = function(req, path, query, callback) {
            req.query = query;
            var args = Array.prototype.slice.call(arguments, 2);
            // superagent[method].apply(null, ['http://localhost:' + apiPort + path].concat(args));
            apiApp.callRoute(method, path, req, callback);
        };
    });

    client.getSession = function(req){
        if(!req.isAuthenticated()) return null;
        return req.session.passport.user;
    };

    return client;
};
