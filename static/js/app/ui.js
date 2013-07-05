(function(Dan){
    "use strict";

    React.renderComponent(
        Dan.app( {categories:[{name: "physics", value: "physics"}]}, null),
        document.querySelector("#main .inner")
    );
    Dan.route.setup({
        "about": function(){
            Dan.slider.show("about", 400);
            Dan.nav.focusLink("about");
        },
        "mirrors": function(){
            Dan.slider.show("mirrors", 500);
            Dan.nav.focusLink("mirrors");
        },
        "upload": function(){
            Dan.slider.show("upload", 550);
            Dan.nav.focusLink("upload");
        },
        "": function(){
            Dan.slider.hide();
        }
    });
})(window.Dan ? window.Dan : window.Dan = {});