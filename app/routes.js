module.exports = function(match, apiClient) {
    match('/', function(callback) {
        console.log('home');

        callback(null, 'index');
    });

    match('/posts', function(callback) {
        console.log('posts');

        apiClient.get('/posts.json', function(err, res) {
            if (err) return callback(err);

            var posts = res.body;
            callback(null, 'posts', {posts: posts});
        });
    });
};
