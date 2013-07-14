/** @jsx React.DOM */
(function(Dan){
    "use strict";

    var uploadForm = Dan.uploadForm = React.createClass({
        render: function() {
            return (
                <div className={"upload-form " + (this.props.hidden ? "hidden" : "")}>Upload</div>
            );
        }
    });
})(window.Dan ? window.Dan : window.Dan = {});