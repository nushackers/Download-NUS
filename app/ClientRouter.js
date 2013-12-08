var Router = require('./router'),
    React = require('react-tools').React,
    DirectorRouter = require('director').Router;

function parsePath(query){
    query = query.substr(1);
    var map = {};
    query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, key, value) {
        map[key] = value;
    });
    return map;
}

module.exports = ClientRouter;

function ResHandler(context, router) {
    this.context = context;
    this.router = router;

    // unlike the server side, in the client side, we only want one res at a time
    this.valid = true;
}

ResHandler.prototype = {
    kill: function(){
        this.valid = false;
    },
    render: function(viewPath, data) {
        if(!this.valid) return;

        // first render
        if(window.initialData) {
            data = window.initialData;
            window.initialData = null;
        }

        React.renderComponent(
            this.router.renderView(viewPath, data, this.router.sessionManager.getSession()),
            document.querySelector("#body-container"));
    },
    err: function(err){
        if(!this.valid) return;
        this.router.handleErr(err);
    },
    redirect: function(location){
        if(!this.valid) return;
        this.router.directorRouter.setRoute(location);
    }
};

function ClientRouter(routes, sessionManager) {
    Router.call(this, routes, DirectorRouter, 'app/views', this.getRouteHandler.bind(this));
    this.sessionManager = sessionManager;
}

ClientRouter.prototype = Object.create(Router.prototype);

ClientRouter.prototype.initPushState = function() {
    this.directorRouter.configure({
        html5history: true
    });
};

ClientRouter.prototype.getReq = function(context, params, route) {
    return {
        query: parsePath(location.search),
        user: this.sessionManager.getSession()
    };
};

ClientRouter.prototype.getRes = function(context) {
    if(this.oldRes) this.oldRes.kill();
    this.oldRes = new ResHandler(context, this);
    return this.oldRes;
};

/**
* Client-side handler to start Clientrouter.
*/
ClientRouter.prototype.start = function() {
    this.initPushState();

    var self = this;

    /**
    * Intercept any links that don't have 'data-pass-thru' and route using
    * pushState.
    */
    $(document.body).on("click", "a", function(e){
        dataset = this.dataset;
        if (dataset.passthru == null || dataset.passthru === 'false') {
            self.directorRouter.setRoute(this.attributes.href.value);
            e.preventDefault();
        }
    }).on("submit", "form", function(e){
        var dataset = this.dataset;
        if(this.method.toUpperCase() === "GET" &&
            (dataset.passthru == null || dataset.passthru === 'false')){
            e.preventDefault();
            self.directorRouter.setRoute(this.action + "?" + $(this).serialize());
        }
    });

    this.directorRouter.init();
};
