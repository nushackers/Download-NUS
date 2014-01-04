var Router = require('./router'),
    React = require('react-tools').React,
    DirectorRouter = require('director').Router,
    progressBar = require("./views/progressBar.jsx"),
    bigFileUpload = require("./bigFileUpload");

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
    ensureHTTPS: function(){
        var isHTTPS = location.protocol === "https:";
        if(isHTTPS) return true;
        else {
            window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
        }
    },
    render: function(viewPath, data) {
        if(!this.valid) return;

        // first render
        if(window.initialData) {
            data = window.initialData;
            window.initialData = null;
        }

        this.router.lastData = data;
        this.router.lastView = viewPath;

        this.router.render();
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
    this.uploader = bigFileUpload;
}

ClientRouter.prototype = Object.create(Router.prototype);

ClientRouter.prototype.initPushState = function() {
    this.directorRouter.configure({
        html5history: true
    });
};

ClientRouter.prototype.getReq = function(context, params, route) {
    this.startLoading(); //hack
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
            console.log(e.target);
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

    $(document).on("ajaxStart", function(){
        self.startLoading();
    }).on("ajaxStop", function(){
        self.finishLoading();
    });


    this.directorRouter.init();
};

ClientRouter.prototype.render = function(){
    console.log(this.sessionManager.getSession(), "render");
    React.renderComponent(
        this.renderView(this.lastView, this.lastData, this.sessionManager.getSession()),
        document.querySelector("#body-container"));
    this.finishLoading();
};

ClientRouter.prototype.refresh = function(){
    this.directorRouter.setRoute(location.pathname);
};

ClientRouter.prototype.setRouteWithData = function(route, data){
    this.priorData = data;
    this.directorRouter.setRoute(route);
};

ClientRouter.prototype.startLoading = function(){
    if(!this.loadingTimer){
        this.loadingTimer = setTimeout(function(){
            $("#loading-screen").addClass("shown");
            this.loadingTimer = 0;
        }.bind(this), 200);
    }
};

ClientRouter.prototype.setProgress = function(progress){
    React.renderComponent(
        progressBar({
            value: progress
        }),
        document.querySelector(".loading-status")
    );
};

ClientRouter.prototype.finishLoading = function(){
    clearTimeout(this.loadingTimer);
    this.loadingTimer = 0;
    $("#loading-screen").removeClass("shown");
};

