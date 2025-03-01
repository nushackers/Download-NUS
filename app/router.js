var _ = require("underscore");

module.exports = Router;

function Router(routes, DirectorRouter, viewsDir, routeParser) {
    this.viewsDir = viewsDir;
    this.directorRouter = new DirectorRouter(this.parseRoutes(routes, routeParser));
}

Router.prototype.parseRoutes = function(routes, routeParser) {
    return _.reduce(_.keys(routes), function(obj, k){
        obj[k] = routeParser(routes[k], k);
        return obj;
    }, {});
};

Router.prototype.getRouteHandler = function(handler, route) {
    var router = this;

    return function() {
        var routeContext = this,
            handleErr = router.handleErr.bind(routeContext),
            req = router.getReq(routeContext);

        try{
            handler.apply(null, [req, router.getRes(routeContext)].concat(Array.prototype.slice.call(arguments)).concat([router.priorData]));
            router.priorData = null;
        } catch (err) {
            handleErr(err);
        }
    };
};

Router.prototype.renderView = function(viewPath, data, session){
    var Component = require(this.viewsDir + '/' + viewPath),
        PageBody = require(this.viewsDir + "/pageBody");
    return PageBody({session: session, router: this}, Component({data: data, router: this, session: session}));
};

Router.prototype.handleErr = function(err) {
    console.log(err);
    if (console.error) {
        console.error(err.message);
        console.error(err.stack);
    }
};
