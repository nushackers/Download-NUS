var _ = require("underscore"),
    truncate = require('truncate-component'),
    NusStrategy = require('./passport-nus').Strategy;


function truncateDatasets(data){
    data.datasets.forEach(function(d){
        d.description = truncate(stripMarkdown(d.description), 30, ' ...');
    });
    return data;
}

module.exports = function(app, prefix, config){
    var dataAccess = require("./Data")(config.db, config.fs, config.date.format);

    var addRoute = function(method, route, callback){
        app[method](prefix + route, callback);
    };

    addRoute('get', '/datasets.json', function(req, res) {
        var page = req.query.page || 1;
        var offset = (page-1)*10;
        
        var search = req.query.q;
        
        // if (search.length < 3) {
        //     res.send({
        //         error: {
        //             title: 'Keywords too short',
        //             description: 'Search keyword must be longer than 2 characters'
        //         }
        //     });
        //     return;
        // }

        dataAccess.performSearch(search, offset)
        .then(truncateDatasets)
        .done(function(data){
            res.send(data);
        });
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
