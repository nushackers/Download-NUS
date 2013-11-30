/**
* Small wrapper around `superagent` module to make it easier to consume
* the API the same way on client & server.
*/
var superagent = require('superagent');

/**
* Proxy each method to `superagent`, formatting the URL.
*/
['get', 'post', 'put', 'path', 'del'].forEach(function(method) {
    module.exports[method] = function(req, path, query, callback) {
        if(window.initialData){
            callback(null, {
                body: window.initialData
            });
            window.initialData = null;
        } else {
            var args = Array.prototype.slice.call(arguments, 2);
            console.log("request");
            superagent[method].apply(null, ['/api' + path].concat(args));
        }
    };
});

