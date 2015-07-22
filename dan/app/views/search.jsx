/**
 * @jsx React.DOM
 */
var React = require('react');

var searchform = require("./searchform.jsx"),
    datasets = require("./datasets.jsx");

module.exports = React.createClass({
  render: function() {
    return (
        <div>
            <searchform q={this.props.data.q} />
            {this.props.data.error ?
                <div className="alert alert-danger">
                    <h2>{this.props.data.error.title}</h2>
                    <p>{this.props.data.error.description}</p>
                </div>
                :
                [
                <h2>{"Search results for " + this.props.data.q}</h2>,
                <datasets datasets={this.props.data.datasets} pages={this.props.data.pages} page={this.props.data.page}/>
                ]
            }
        </div>  
    );
  }
});
