(function(Dan){
    "use strict";

    var route = Dan.route = {};

    var routes = {};

    var regex = /#!([^!#]*)/;
    var parse = function(str){
        var r = regex.exec(str);
        if(r && r[1]){
            return r[1];
        }
        return "";
    };

    var hashChanged = function(){
        var h = parse(window.location.hash + "");
        var fns = routes[h];
        if(fns){
            fns.forEach(function(f){
                f();
            });
        }
    };

    $(window).on("hashchange", hashChanged);

    route.register = function(hash, fn){
        if(routes[hash]){
            routes[hash].push(fn);
        }else{
            routes[hash] = [fn];
        }
        hashChanged();
    };

    route.setup = function(map){
        for(var m in map){
            route.register(m, map[m]);
        }
    };

})(window.Dan ? window.Dan : window.Dan = {});