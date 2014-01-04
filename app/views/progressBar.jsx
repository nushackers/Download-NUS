/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

module.exports = React.createClass({
  render: function() {
    return (
        <div className={"progress progress-striped" + (this.props.value == 100 ? "" : " active")}>
          <div className="progress-bar progress-bar-info" role="progressbar" aria-valuenow={this.props.value} aria-valuemin="0" aria-valuemax="100" style={{
            width: this.props.value + "%"
          }}>
            <span className="sr-only">{ this.props.value + "% Complete" }</span>
          </div>
        </div> 
    );
  }
});
