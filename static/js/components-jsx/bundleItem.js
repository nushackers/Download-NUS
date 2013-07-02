/** @jsx React.DOM */
(function(Dan){
    Dan.bundleItem = React.createClass({
        render: function() {
            return (
                <li>
                    <div className="description">{this.props.data.description}</div>
                </li>
            );
        }
    });
})(window.Dan ? window.Dan : window.Dan = {});