module.exports = function(match, apiClient) {
    match('/', function(req, callback) {
        console.log('home');

        callback(null, 'index');
    });

    match('/posts', function(req, callback) {
        console.log('posts');

        apiClient.get(req, '/posts.json', function(err, res) {
            if (err) return callback(err);

            var posts = res.body;
            callback(null, 'posts', {posts: posts});
        });
    });
};
