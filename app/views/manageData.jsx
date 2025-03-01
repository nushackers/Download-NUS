/**
 * @jsx React.DOM
 */
var React = require('react');

var datasets = require("./datasets.jsx");

module.exports = React.createClass({
  render: function() {
    return (
        <div>
            <h2>Manage Your Datasets</h2>
            <datasets session={this.props.session} datasets={this.props.data.datasets} page={this.props.data.page} pages={this.props.data.pages} />
        </div>
    );
  }
});

