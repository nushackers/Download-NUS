module.exports = function(apiClient, initialSession){
    var session = initialSession;
    return {
        logout: function(){
            apiClient.post({}, "/logout", {}, function(){
                session = null;
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