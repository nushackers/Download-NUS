/** @jsx React.DOM */
(function(Dan){
    "use strict";

    var uploadForm = Dan.uploadForm,
        loginForm = Dan.loginForm;

    var uploadLoginTab = Dan.uploadLoginTab = React.createClass({
        render: function() {
            return (
                <div>
                    <div className={"loading" + (this.props.loading ? "" : " hidden")} />
                    <uploadForm hidden={this.props.loading || this.props.needLogin} />
                    <loginForm  hidden={this.props.loading || !this.props.needLogin} />
                </div>
            );
        }
    });
})(window.Dan ? window.Dan : window.Dan = {});