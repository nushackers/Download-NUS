module.exports = function(apiClient, router){
    return {
        logout: function(){
            apiClient.post({}, "/logout", {}, function(){
                apiClient.setSession(null);
                router.directorRouter.setRoute(location.pathname);
            });
        }
    };
};