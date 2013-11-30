/**
* Small wrapper around `superagent` module to make it easier to consume
* the API the same way on client & server.
*/
var superagent = require('superagent');

module.exports = function(apiPort){
    var client = {};
    /**
    * Proxy each method to `superagent`, formatting the URL.
    */
    ['get', 'post', 'put', 'path', 'del'].forEach(function(method) {
        client[method] = function(path) {
            var args = Array.prototype.slice.call(arguments, 1);
            superagent[method].apply(null, ['http://localhost:' + apiPort + path].concat(args));
        };
    });

    return client;
};
