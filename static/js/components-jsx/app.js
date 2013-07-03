/** @jsx React.DOM */
(function(Dan){
    "use strict";

    var bundleView = Dan.bundleView,
        filterBar = Dan.filterBar;
    var app = React.createClass({
        getInitialState: function() {
            return {
                filter: {}
            };
        },
        render: function() {
            return (
                <div>
                    <filterBar categories={this.props.categories} onFilterChange={this.applyFilter} />
                    <bundleView filter={ this.state.filter } updateData={Dan.api.fetchMetaData}/>
                </div>
            );
        },
        applyFilter: React.autoBind(function(filter){
            this.setState({
                filter: filter
            });
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