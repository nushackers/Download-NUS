/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

var searchform = require("./searchform.jsx"),
    datasets = require("./datasets.jsx");

module.exports = React.createClass({
  render: function() {
    return (
        <div>
            <searchform q={this.props.q} />
            {this.props.error ?
                [
                <h2>{this.props.error.title}</h2>,
                <p>{this.props.error.description}</p>
                ] :
                [
                <h2>{"Search results for " + this.props.q}</h2>,
                <datasets datasets={this.props.datasets} pages={this.props.pages} page={this.props.page}/>
                ]
            }
        </div>  
    );
  }
});
