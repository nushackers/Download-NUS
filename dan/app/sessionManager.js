module.exports = function(apiClient, initialSession){
    var session = initialSession;
    return {
        logout: function(callback){
            $.post("/api/logout", function(){
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