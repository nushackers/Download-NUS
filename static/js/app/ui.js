(function(Dan){
    "use strict";

    React.renderComponent(
        Dan.app( {categories:[{name: "physics", value: "physics"}]}, null),
        document.querySelector("#main .inner")
    );

    var uploadView = React.renderComponent(
        Dan.uploadLoginTab( {loading: true}, null),
        document.querySelector(".upload-tab")
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

    Dan.session.whenLogin(function(){
        uploadView.setProps({
            needLogin: false,
            loading: false
        });
    }).whenLogout(function(){
        uploadView.setProps({
            needLogin: true,
            loading: false
        });
    }).whenNetworkError(function(err){
        document.write(err);
    }).whenLoading(function(){
        uploadView.setProps({
            loading: true
        });
    });

    Dan.session.login();

})(window.Dan ? window.Dan : window.Dan = {});