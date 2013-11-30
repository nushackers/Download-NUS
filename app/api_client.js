/**
* Small wrapper around `superagent` module to make it easier to consume
* the API the same way on client & server.
*/
var superagent = require('superagent');

/**
* Proxy each method to `superagent`, formatting the URL.
*/
['get', 'post', 'put', 'path', 'del'].forEach(function(method) {
    module.exports[method] = function(path) {
        var args = Array.prototype.slice.call(arguments, 1);
        superagent[method].apply(null, ['/api' + path].concat(args));
    };
});

