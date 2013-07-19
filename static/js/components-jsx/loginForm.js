/** @jsx React.DOM */
(function(Dan){
    "use strict";

    Dan.loginForm = React.createClass({
        getInitialState: function(){
            return {
                error: null
            };
        },
        getError: React.autoBind(function(err){
            this.setState({
                error: err.message
            });
        }),
        submitForm: React.autoBind(function(){
            Dan.session.login(
                this.refs.username.getDOMNode().value.trim(),
                this.refs.password.getDOMNode().value.trim(),
                this.refs.domain.getDOMNode().value.trim()
            ).fail(this.getError);
            return false;
        }),
        render: function() {
            return (
                <div>
                    <div className={'error' + (this.state.error ? "" : " hidden")}>
                        {this.state.error}
                    </div>
                    <form className={"login-form " + (this.props.hidden ? "hidden" : "")} onSubmit={this.submitForm}>
                        <input type='text' name='domain' placeholder='Domain' ref="domain" />
                        <input type='text' name='username' placeholder='Username' ref="username" />
                        <input type='password' name='password' placeholder='Password' ref="password"/>
                        <input type='submit' />
                    </form>
                </div>
            );
        }
    });
})(window.Dan ? window.Dan : window.Dan = {});