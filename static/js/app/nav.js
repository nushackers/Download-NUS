(function(Dan){
    "use strict";

    var nav = Dan.nav = {};

    nav.focusLink = function(link){
        $("nav a.cur").removeClass("cur");
        $("nav ." + link + "-link").addClass("cur");
    };
})(window.Dan ? window.Dan : window.Dan = {});