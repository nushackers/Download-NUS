var express = require('express');

var app = express();
app.listen(3000);
console.log('listening on port 3000');

app.configure(function() {
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use("/", express.static(__dirname + '/../static'));
    app.use(function(err, req, res, next){
        console.error(err.stack);
        res.send({
            error: err.message
        });
    });
});