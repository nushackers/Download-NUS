var director = require('director'),
    isServer = typeof window === 'undefined',
    React = require('react-tools').React,
    viewsDir = (isServer ? __dirname : 'app') + '/views',
    url = require("url"),
    DirectorRouter;

function parsePath(query){
    query = query.substr(1);
    var map = {};
    query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, key, value) {
        (map[key] = map[key] || []).push(value);
    });
    return map;
}

if (isServer) {
    DirectorRouter = director.http.Router;
} else {
    DirectorRouter = director.Router;
}

module.exports = Router;

function Router(routesFn, apiClient) {
    this.apiClient = apiClient;
    if (routesFn == null) throw new Error("Must provide routes.");

    this.directorRouter = new DirectorRouter(this.parseRoutes(routesFn));

    if(!isServer) {
        window.directorRouter = this.directorRouter;
        this.sessionManager = require("./sessionManager")(apiClient, this);
    }

    // Express middleware.
    if (isServer) {
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
}

/**
* Capture routes as object that can be passed to Director.
*/
Router.prototype.parseRoutes = function(routesFn) {
    var routes = {};

    routesFn(function(pattern, handler) {
        // Server routes are an object, not a function. We just use `get`.
        if (isServer) {
            routes[pattern] = {
                get: this.getRouteHandler(handler)
            };
        } else {
            routes[pattern] = this.getRouteHandler(handler);
        }
    }.bind(this), this.apiClient);

    return routes;
};

Router.prototype.getRouteHandler = function(handler) {
    var router = this;
    var apiClient = this.apiClient;

    return function() {
        /** If it's the first render on the client, just return; we don't want to
        * replace the page's HTML.
        */
        var routeContext = this,
            params = Array.prototype.slice.call(arguments),
            handleErr = router.handleErr.bind(routeContext);

        var req = routeContext.req;

        if(!req){
            req = {
                query: parsePath(location.search)
            };
        }

        function handleRoute() {
            handler.apply(null, [req].concat(params).concat(function routeHandler(err, viewPath, data) {
                if (err) return handleErr(err, router.directorRouter);

                data = data || {};

                var session = apiClient.getSession(req);

                if (isServer){
                    router.handleServerRoute(router.wrapWithLayout(router.renderView(viewPath, data, session), data, session), routeContext.req, routeContext.res);
                } else {
                    router.handleClientRoute(router.renderView(viewPath, data, session));
                    if(window.initialData){
                        window.initialData = null;
                        window.session = null;
                    }
                }
            }));
        }

        try {
            handleRoute();
        } catch (err) {
            handleErr(err);
        }
    };
};

Router.prototype.renderView = function(viewPath, data, session){
    console.log(data, session, "render", viewPath);
    var Component = require(viewsDir + '/' + viewPath),
        PageBody = require(viewsDir + "/pageBody");
    return PageBody({session: session, router: this}, Component({data: data, router: this, session: session}));
};

Router.prototype.handleErr = function(err) {
    if(err.redirect){
        if(isServer){
            this.res.redirect(err.redirect);
        } else {
            directorRouter.setRoute(err.redirect);
        }
    } else {
        console.error(err.message + err.stack);

        // `this.next` is defined on the server.
        if (this.next) {
            this.next(err);
        } else {
            console.log(err);
        }
    }
};

Router.prototype.updateSession = function(session){
    this.apiClient.setSession(session);
};

Router.prototype.wrapWithLayout = function(component, data, session) {
    var layout = require(viewsDir + '/layout');
    return layout({initialData: data, session: session}, [component]);
};

Router.prototype.handleClientRoute = function(component, data) {
    React.renderComponent(component, document.querySelector("#body-container"));
};

Router.prototype.handleServerRoute = function(component, req, res) {
    React.renderComponentToString(component, function(html) {
        res.send(html);
    });
};

Router.prototype.initPushState = function() {
    this.directorRouter.configure({
        html5history: true
    });
};

/**
* Client-side handler to start router.
*/
Router.prototype.start = function() {
    this.initPushState();

    /**
    * Intercept any links that don't have 'data-pass-thru' and route using
    * pushState.
    */
    document.addEventListener('click', function(e) {
        var el = e.target,
        dataset = el && el.dataset;
        if (el && el.nodeName === 'A' && (
            dataset.passthru == null || dataset.passthru === 'false'
            )) {
                this.directorRouter.setRoute(el.attributes.href.value);
                e.preventDefault();
            }
    }.bind(this), false);

    document.addEventListener("submit", function(e){
        var ef = e.target,
            dataset = ef && ef.dataset;
        if(ef && ef.method.toUpperCase() === "GET" &&
            (dataset.passthru == null || dataset.passthru === 'false')){
            e.preventDefault();
            this.directorRouter.setRoute(ef.action + "?" + $(ef).serialize());
        }
    }.bind(this), false);

    this.directorRouter.init();
};
