var Router = require('../app/router'),
    React = require('react-tools').React,
    DirectorRouter = require('director').http.Router;

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
        React.renderComponentToString(
            this.router.renderView(viewPath, data, this.context.req.user),
            function(html) {
                res.send(html);
            });
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

ServerRouter.prototype.renderView = function(viewPath, data, session) {
    return this.wrapWithLayout(Router.prototype.renderView.call(this, viewPath, data, session), data, session);
};

ServerRouter.prototype.wrapWithLayout = function(component, data, session) {
    var layout = require(this.viewsDir + '/layout');
    return layout({initialData: data, session: session}, [component]);
};
