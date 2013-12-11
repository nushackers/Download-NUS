var _ = require("underscore");

module.exports = function(apiClient, insecure) {
    return {
        '/': function(req, res) {
            res.render('index');
        },
        '/posts': function(req, res) {
            apiClient.get(req, '/posts.json', {}, function(err, re) {
                if (err) return res.err(err);

                var posts = re.body;
                res.render('posts', {posts: posts});
            });
        },
        '/search': function(req, res) {
            apiClient.get(req, '/datasets.json', req.query, function(err, re){
                if(err){
                    return res.err(err);
                }
                res.render('search', re.body);
            });
        },
        '/data': function(req, res) {
            apiClient.get(req, '/datasets.json', req.query, function(err, re){
                if(err){
                    return res.err(err);
                }
                res.render('data', re.body);
            });
        },
        '/manage': function(req, res) {
            if(!req.user){
                res.redirect("/login");
            } else {
                var user = req.user;
                apiClient.get(req, '/datasets.json', {user: user && user.nusId}, function(err, re){
                    if(err){
                        return res.err(err);
                    }
                    res.render('manageData', re.body);
                });
            }
        },
        '/upload': function(req, res) {
            if(!req.user){
                res.redirect("/login");
            } else {
                res.render('dataEdit', {});
            }
        },
        '/login': function(req, res) {
            var ok = true;
            if(!insecure) {
                ok = res.ensureHTTPS();
            }
            if(ok){
                if(req.user){
                    res.redirect("/");
                } else {
                    res.render('login');
                }
            }
        },
        '/data/:id': function(req, res, id, data) {
            if('edit' in req.query && !req.user){
                res.redirect("/login");
            } else {
                if(data){
                    if('edit' in req.query){
                        res.render('dataEdit', data);
                    } else {
                        res.render('dataDisplay', data);
                    }
                } else {
                    apiClient.get(req, '/datasets/' + id, req.query, function(err, re){
                        if(err || (re.body && re.body.err)){
                            return res.err(err || re.body.err);
                        }
                        if('edit' in req.query){
                            res.render('dataEdit', re.body);
                        } else {
                            res.render('dataDisplay', re.body);
                        }
                    });
                }
            }
        }
    };
};
