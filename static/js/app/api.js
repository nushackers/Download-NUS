(function(Dan){
    "use strict";

    Dan.api = {
        fetchMetaData: function(filter){
            var d = $.Deferred();
            setTimeout(function(){
                d.resolve([
                {
                    description: "Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements",
                    name: "Data from my ex",
                    category: "physics",
                    size: "1000G",
                    uploader: "Mr Bob",
                    type: "Textual",
                    lastUpdate: "1 Dec 2012"
                },
                {
                    description: "Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements, Data generated from all my experiements",
                    name: "Data from my ex",
                    category: "physics",
                    size: "1000G",
                    uploader: "Mr Bob",
                    type: "Textual",
                    lastUpdate: "1 Dec 2012"
                },
                {
                    description: "Data generated from all my experiements",
                    name: "Data from my ex",
                    category: "physics",
                    size: "1000G",
                    uploader: "Mr Bob",
                    type: "Textual",
                    lastUpdate: "1 Dec 2012"
                },
                {
                    description: "Data generated from all my experiements",
                    name: "Data from my ex",
                    category: "physics",
                    size: "1000G",
                    uploader: "Mr Bob",
                    type: "Textual",
                    lastUpdate: "1 Dec 2012"
                },
                {
                    description: "Data generated from all my experiements",
                    name: "Data from my ex",
                    category: "physics",
                    size: "1000G",
                    uploader: "Mr Bob",
                    type: "Textual",
                    lastUpdate: "1 Dec 2012"
                },
                {
                    description: "Data generated from all my experiements",
                    name: "Data from my ex",
                    category: "physics",
                    size: "1000G",
                    uploader: "Mr Bob",
                    type: "Textual",
                    lastUpdate: "1 Dec 2012"
                },
                {
                    description: "Data generated from all my experiements",
                    name: "Data from my ex",
                    category: "physics",
                    size: "1000G",
                    uploader: "Mr Bob",
                    type: "Textual",
                    lastUpdate: "1 Dec 2012"
                }
                ]);
            }, 100);
            return d;
        }
    };
})(window.Dan ? window.Dan : window.Dan = {});