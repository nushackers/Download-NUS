/** @jsx React.DOM */
(function(Dan){
    "use strict";

    Dan.loginForm = React.createClass({
        render: function() {
            return (
                <div className={"login-form " + this.props.hidden ? "hidden" : ""}>login</div>
            );
        }
    });
})(window.Dan ? window.Dan : window.Dan = {});