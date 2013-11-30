var _ = require("underscore");

module.exports = function(app, prefix){
    var addRoute = function(method, route, callback){
        app[method](prefix + route, callback);
    };

    addRoute('get', '/posts.json', function(req, res) {
        if(req.session.loggedIn){
            res.send(["loggedIn",req.session.loggedIn]);
        } else {
            res.send(["aha"]);
        }
    });

    addRoute('get', "/login", function(req, res){
        req.session.loggedIn = req.param("user");
        res.send({
            success: true,
            user: req.session.loggedIn
        });
    });

    app.callRoute = function(method, path, req, callback) {
        var fakeRes = {
            send: function(obj){
                callback(null, {body: obj});
            }
        };
        var handler = app.getRouteHandler(method, prefix + path);
        if(handler){
            try{
                handler(req, fakeRes);
            } catch(e){
                callback(e);
            }
        } else {
            callback("no such route " + path);
        }
    };

    app.getRouteHandler = function(method, path){
        var paths = app.routes[method];
        var route = _.find(app.routes[method], function(p) { return p.path === path; });
        if(route) {
            // TODO: multiple callbacks?
            return route.callbacks[0];
        } else {
            return undefined;
        }
    };

    return app;
};
