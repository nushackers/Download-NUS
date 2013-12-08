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
                apiClient.get(req, '/metadata.json', {}, function(err, re){
                    if(err){
                        return res.err(err);
                    }
                    res.render('dataEdit', re.body);
                });
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
        '/data/:id': function(req, res, id) {
            if('edit' in req.query && !req.user){
                res.redirect("/login");
            } else {
                apiClient.get(req, '/datasets/' + id, req.query, function(err, re){
                    if(err || (re.body && re.body.err)){
                        return res.err(err || re.body.err);
                    }
                    if('edit' in req.query){
                        apiClient.get(req, '/metadata.json', {}, function(err, metaRe){
                            res.render('dataEdit', _.extend(re.body, metaRe.body));
                        });
                    } else {
                        res.render('dataDisplay', re.body);
                    }
                });
            }
        }
    };
};
