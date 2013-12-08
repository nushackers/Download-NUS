/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

var pageBody = require("./pageBody.jsx");

module.exports = React.createClass({
  render: function() {
    return (
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title>Download@NUS</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="" />
            <meta name="author" content="" />
            
            <link href="/css/bootstrap.min.css" rel="stylesheet" />
            <link href="/css/style.css" rel="stylesheet" />
            
        </head>
        <body>
            <div id="body-container">
                {this.props.children}
            </div>
            <div id="loading-screen">
                <div className="loading-gear" />
            </div>
            <script dangerouslySetInnerHTML={{__html: "window.initialData=" + JSON.stringify(this.props.initialData) + "; window.initialSession=" + JSON.stringify(this.props.session)}} />
            <script src="/js/jquery-1.10.2.min.js"></script>
            <script src="/js/bootstrap.min.js"></script>
            <script src="/scripts.js"></script>
        </body>
    </html>
    );
  }
});

