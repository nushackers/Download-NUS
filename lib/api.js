var express = require('express'),
    httpProxy = require('http-proxy'),
    app = express();

module.exports = app;

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: "my_secret"}));

app.get('/posts.json', function(req, res) {
    if(req.session.loggedIn){
        res.send(["loggedIn",req.session.loggedIn]);
    } else {
        res.send(["aha"]);
    }
});

app.get("/login", function(req, res){
    req.session.loggedIn = req.param("user");
    res.send({
        success: true
    });
});


/**
 * On the client, we want to be able to just send API requests to the
 * main web server using a relative URL, so we proxy requests to the
 * API server here.
 */
 var proxy = new httpProxy.RoutingProxy();

 app.proxyMiddleware = function(apiPort) {
    return function(req, res, next) {
        proxy.proxyRequest(req, res, {
            host: 'localhost',
            port: apiPort
        });
    };
};
