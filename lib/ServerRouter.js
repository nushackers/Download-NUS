var Router = require('../app/router'),
    React = require('react-tools').React,
    DirectorRouter = require('director').http.Router,
    ejs = require("ejs"),
    fs = require("fs");

var layoutTemplate = fs.readFileSync(__dirname + '/../app/views/layout.ejs', 'ascii');

module.exports = ServerRouter;

function ResHandler(context, router){
    this.context = context;
    this.router = router;
}

ResHandler.prototype = {
    err: function(err) {
        this.router.handleErr(err);
    },

    redirect: function(location){
        this.context.res.redirect(location);
    },

    render: function(viewPath, data) {
        var res = this.context.res;

        var session = this.context.req.user;
        React.renderComponentToString(
            this.router.renderView(viewPath, data, session),
            function(reactRoot) {
                var html = ejs.render(layoutTemplate, {
                    initialData: data,
                    session: session,
                    reactRoot: reactRoot
                });
                res.send(html);
            });
    },

    ensureHTTPS: function(){
        if(this.context.req.header('x-forwarded-proto') !== "https"){
            this.context.res.redirect("https://" + this.context.req.headers.host + this.context.req.path);
            return false;
        } else {
            return true;
        }
    }
};

function ServerRouter(routes) {
    Router.call(this, routes, DirectorRouter, '../app/views', function(handler) {
        return {
            get: this.getRouteHandler(handler)
        };
    }.bind(this));

    // Express middleware.
    this.middleware = function(req, res, next) {
        // Attach `this.next` to route handler, for better handling of errors.
        this.directorRouter.attach(function() {
            this.next = next;
        });

        this.directorRouter.dispatch(req, res, function (err) {
            if (err) {
                next(err);
            }
        });
    }.bind(this);
}

ServerRouter.prototype = Object.create(Router.prototype);

ServerRouter.prototype.getReq = function(context) {
    return context.req;
};

ServerRouter.prototype.getRes = function(context) {
    return new ResHandler(context, this);
};
