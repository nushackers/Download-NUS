var _ = require("underscore");

// chunk size about 200m (put this to config?)
// the first chunk is 1k just to allow detecting mimetype
var chunkSize = 1024 * 1024 * 200;
    initChunkSize = 1000;

function buildFormData(formArray, file){
    var formData = new FormData();
    formArray.forEach(function(entry){
        formData.append(entry.name, entry.value);
    });
    formData.append("file", file);

    return formData;
}

function uploadFile(file, ticket){
    var d = $.Deferred();

    function uploadFrom(seq){
        console.log("upload seq", seq);
        var chunk = seq ? chunkSize : initChunkSize;

        $.ajax({
            url: "/api/upload/" + ticket + "/" + seq,
            type: "POST",
            data: buildFormData([], file.slice(seq, seq + chunk)),
            cache: false,
            contentType: false,
            processData: false,
            xhr: function(){
                var xhr = jQuery.ajaxSettings.xhr();
                xhr.upload.addEventListener("progress", function(evt){
                    d.notify(Math.round(100 * (evt.loaded + seq) / file.size));
                }, false);
                return xhr;
            }
        }).done(function(data){
            console.log("upload chunk", data);
            if(data.err){
                d.resolve(data);
            } else {
                if(data.ack === file.size){
                    d.resolve({
                        ticket: ticket
                    });
                } else {
                    uploadFrom(data.ack);
                }
            }
        }).fail(function(err){
            d.reject(err);
        });
    }

    uploadFrom(0);

    return d;
}

module.exports = {
    /*
     * Uploads the formdata to /api/datasets, cutting files to chunks
     */
    upload: function(file){
        var handshake = $.post("/api/upload", { filename: file.name, filesize: file.size });
        return handshake.then(function(data){
            if(data.err){
                return $.Deferred().reject(data);
            } else {
                return uploadFile(file, data.ticket);
            }
        });
    }
};