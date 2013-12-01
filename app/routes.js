module.exports = function(match, apiClient) {
    match('/', function(req, callback) {
        callback(null, 'index');
    });

    match('/posts', function(req, callback) {
        apiClient.get(req, '/posts.json', function(err, res) {
            if (err) return callback(err);

            var posts = res.body;
            callback(null, 'posts', {posts: posts});
        });
    });


    match('/search', function(req, callback) {
        apiClient.get(req, '/datasets.json', req.query, function(err, res){
            if(err){
                return callback(err);
            }
            callback(null, 'search', res.body);
        });
    });

    match('/data', function(req, callback){
        apiClient.get(req, '/datasets.json', req.query, function(err, res){
            if(err){
                return callback(err);
            }
            callback(null, 'data', res.body);
        });
    });

    match('/manage', function(req, callback){
        if(!apiClient.getSession(req)){
            callback({
                redirect: "/login"
            });
        } else {
            var session = apiClient.getSession(req);
            apiClient.get(req, '/datasets.json', {user: session && session.nusId}, function(err, res){
                if(err){
                    return callback(err);
                }
                callback(null, 'manageData', res.body);
            });
        }
    });

    match('/login', function(req, callback){
        if(apiClient.getSession(req)){
            callback({
                redirect: "/"
            });
        } else {
            callback(null, 'login');
        }
    });

    match('/data/:id', function(req, id, callback){
        apiClient.get(req, '/datasets/' + id + ".json", req.query, function(err, res){
            if(err){
                return callback(err);
            }
            callback(null, 'dataDisplay', res.body);
        });
    });
};
