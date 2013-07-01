/** @jsx React.DOM */
(function(Dan){
    var loginForm = Dan.loginForm;
    var app = React.createClass({
        render: function() {
            return (
                <loginForm />
            );
        }
    });
    React.renderComponent(
        <app />,
        document.querySelector("#main")
    );
})(window.Dan ? window.Dan : window.Dan = {});