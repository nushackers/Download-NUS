/**
 * @jsx React.DOM
 */
var React = require('react');

var navHeader = require("./navHeader.jsx");

module.exports = React.createClass({
  render: function() {
    return (
    <div>
        <navHeader router={this.props.router} session={this.props.session} sessionManager={this.props.router.sessionManager}/>
        <div className="container">
            <div className="page-header">
                <h1><img src="/img/logo.gif" height="76" width="334" /></h1>
            </div>

            <div>
              {this.props.children}
            </div>

            <div style={{height:"1px"}}></div>
                <hr />
            <div className="footer">
                &copy; Copyright 2013 National University of Singapore. All Rights Reserved.
            </div>
        </div>
    </div>
    );
  }
});

