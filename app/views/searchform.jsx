/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <h2>Data Search</h2>
        <p>Find datasets useful for your research</p>
        <form action="/search" method="get" className="form-horizontal">
            <div className="form-group">
                <div className="col-lg-10 col-sm-10">
                    <input ref="searchInput" type="text" className="form-control" name="q" placeholder="Search for..." defaultValue={this.props.q} />
                </div>
                <div className="col-lg-2 col-sm-2">
                    <button type="submit" className="form-control btn-primary">Search</button>
                </div>
            </div>
        </form>
      </div>
    );
  }
});


