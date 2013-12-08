module.exports = function(apiClient, initialSession){
    var session = initialSession;
    return {
        logout: function(callback){
            apiClient.post({}, "/logout", {}, function(){
                session = null;
                callback();
            });
        },
        getSession: function(){
            return session;
        },
        setSession: function(val){
            session = val;
        }
    };
};