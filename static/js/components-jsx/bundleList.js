/** @jsx React.DOM */
(function(Dan){
    "use strict";

    var bundleItem = Dan.bundleItem;
    Dan.bundleList = React.createClass({
        render: function() {
            return (
                <ul className="bundle-list clear-list">
                    {
                        this.props.data.map(function(d){
                        return <bundleItem data={d} />
                        })
                    }
                </ul>
            );
        }
    });
})(window.Dan ? window.Dan : window.Dan = {});