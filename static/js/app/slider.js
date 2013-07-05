(function(Dan){
    "use strict";

    var slider = Dan.slider = {};

    var dom = $(".slider");

    var shown = false;

    slider.show = function(cmp, width){
        var trans = shown ? "" : "0s";
        shown = true;
        dom.find(".inner").css({
            "width": width,
            "transition": trans
        });
        dom.find(".cur").removeClass("cur");
        dom.find("." + cmp + "-tab").addClass("cur");
        dom.addClass("shown");
    };

    slider.hide = function(){
        shown = false;
        dom.removeClass("shown");
        window.location.hash = "";
    };

    $(document.body).on("click", function(){
        slider.hide();
    });

    dom.find(".inner").on("click", function(evt){
        evt.stopPropagation();
    });

})(window.Dan ? window.Dan : window.Dan = {});