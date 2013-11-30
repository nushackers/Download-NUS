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
};
