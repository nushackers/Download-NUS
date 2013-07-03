(function(Dan){
    "use strict";

    Dan.api = {
        fetchMetaData: function(filter){
            var d = $.Deferred();
            setTimeout(function(){
                d.resolve([
                {
                    description: "ehhh"
                }
                ]);
            }, 1000);
            return d;
        }
    };
})(window.Dan ? window.Dan : window.Dan = {});