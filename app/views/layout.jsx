/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

module.exports = React.createClass({
  render: function() {
    return (
      <html>
        <head>
          <title>Test</title>
          <link href="/styles.css" rel="stylesheet" />
        </head>
        <body>

        <div class="container" id="view-container">
          {this.props.children}
        </div>

        <script src="/scripts.js"></script>
        </body>
    </html>
    );
  }
});

