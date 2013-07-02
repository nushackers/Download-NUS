/** @jsx React.DOM */
(function(Dan){
    var bundleList = Dan.bundleList;
    var app = React.createClass({
        getInitialState: function() {
            return {
                data: [{description: "eeh"}]
            };
        },
        render: function() {
            return (
                <div>
                    <header onClick={this.eh}>
                        Welcome my lord.
                    </header>
                    <bundleList data={ this.state.data } />
                </div>
            );
        },
        eh: React.autoBind(function(event){
            var d = this.state.data;
            d.push({
                description: "eh"
            });
            this.setState({
                data: d
            });
        })
    });
    React.renderComponent(
        <app />,
        document.querySelector("#main .inner")
    );
})(window.Dan ? window.Dan : window.Dan = {});