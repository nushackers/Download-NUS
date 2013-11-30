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
        // var page = req.query.page || 1;
        // var offset = (page-1)*10;
        
        // var search = req.query.q;
        callback(null, 'search', {q: "search"});
    });
};
