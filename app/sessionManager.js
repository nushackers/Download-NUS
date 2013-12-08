module.exports = function(apiClient, initialSession){
    var session = null;
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