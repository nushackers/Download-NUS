/**
 * @jsx React.DOM
 */
var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Posts</h1>
        <ul>
        {this.props.posts.map(function(post) {
          return <li><a href={'/posts/' + post}>{post}</a></li>;
        })}
        </ul>
      </div>
    );
  }
});


