/** @jsx React.DOM */
(function(Dan){
    "use strict";

    Dan.loginForm = React.createClass({
        handleSubmit: React.autobind(function(){
            var name = this.refs.author.getDOMNode().value.trim();
            var pw = this.refs.text.getDOMNode().value.trim();
            if (!name || !pw) {
                return false;
            }
            return false;
        }),
        render: function() {
            return (
                <form className={"login-form " + (this.props.hidden ? "hidden" : "")}>
                    <input type='text' id='username' placeholder='Username' />
                    <input type='password' id='password' placeholder='Password' />
                    <input type='submit' />
                </form>
            );
        }
    });
})(window.Dan ? window.Dan : window.Dan = {});