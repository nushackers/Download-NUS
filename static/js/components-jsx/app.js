/** @jsx React.DOM */
(function(Dan){
    "use strict";

    var bundleList = Dan.bundleList,
        filterBar = Dan.filterBar;
    var app = React.createClass({
        getInitialState: function() {
            return {
                data: [{description: "eeh"}]
            };
        },
        render: function() {
            return (
                <div>
                    <filterBar categories={this.props.categories} onFilterChange={this.applyFilter} />
                    <bundleList data={ this.state.data } />
                </div>
            );
        },
        applyFilter: React.autoBind(function(filter){
            console.log(filter);
        })
    });
    React.renderComponent(
        <app categories={[{
                        name: "physics",
                        value: "physics"
                    }]}/>,
        document.querySelector("#main .inner")
    );
})(window.Dan ? window.Dan : window.Dan = {});