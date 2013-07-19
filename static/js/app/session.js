(function(Dan){
    "use strict";

    var networkError = null;

    var listeners = (function(){
        var fns = {};

        return {
            add: function(eve, fn){
                if(!fns[eve]){
                    fns[eve] = [];
                }
                fns[eve].push(fn);
            },
            trigger: function(eve, param){
                if(fns[eve]){
                    fns[eve].forEach(function(fn){
                        fn(param);
                    });
                }
            }
        };
    })();

    var userInfo = {};

    var STATES = (function(){
        var ind = 0;
        return {
            NETWORK_ERROR: ind++,
            LOADING: ind++,
            LOGGEDIN: ind++,
            LOGGEDOUT: ind++
        };
    })();

    var state = STATES.LOADING;

    Dan.session = {
        STATES: STATES,
        login: function(username, password, windomain){
            state = STATES.LOADING;
            listeners.trigger("loading");
            return Dan.api.login(username, password, windomain).done(function(data){
                state = STATES.LOGGEDIN;
                listeners.trigger("login", data.userInfo);
                userInfo = data.userInfo;
            }).fail(function(err){
                if(err.network){
                    state = STATES.NETWORK_ERROR;
                    listeners.trigger("network", err.network);
                }else{
                    state = STATES.LOGGEDOUT;
                    listeners.trigger("logout");
                }
            });
        },
        logout: function(){
            state = STATES.LOADING;
            listeners.trigger("loading");
            return Dan.api.logout().done(function(data){
                state = STATES.LOGGEDOUT;
                listeners.trigger("logout");
            });
        },
        whenLogin: function(fn){
            listeners.add("login", fn);
            if(state === STATES.LOGGEDIN){
                fn(userInfo);
            }
            return this;
        },
        whenLogout: function(fn){
            listeners.add("logout", fn);
            if(state === STATES.LOGGEDOUT){
                fn();
            }
            return this;
        },
        whenNetworkError: function(fn){
            listeners.add("network", fn);
            if(state === STATES.NETWORK_ERROR){
                fn(networkErred);
            }
            return this;
        },
        whenLoading: function(fn){
            listeners.add("loading", fn);
            if(state === STATES.LOADING){
                fn();
            }
        },
        getState: function(){
            return state;
        },
        getUserInfo: function(){
            return userInfo;
        }
    };
})(window.Dan ? window.Dan : window.Dan = {});