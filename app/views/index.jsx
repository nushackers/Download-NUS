/**
 * @jsx React.DOM
 */
var React = require('react');

var searchform = require("./searchform.jsx");

module.exports = React.createClass({
  render: function() {
    return (
        <div>
            <searchform />
            <div className="row">
                <div className="col-lg-4 col-sm-4">
                    <a href="/data" className="btn glyphicon glyphicon-save big-icon"></a>
                    <h3>Open</h3>
                    <p className="lead">Download@NUS is an open-platform. Anyone can access our collection of data.</p>
                    <a href="/data">More...</a>
                </div>
                <div className="col-lg-4 col-sm-4">
                    <a href="/upload" className="btn glyphicon glyphicon-cloud-upload big-icon"></a>
                    <h3>Community</h3>
                    <p className="lead">All data is contributed by members of the NUS research community.</p>
                    <a href="/upload">More...</a>
                </div>
                <div className="col-lg-4 col-sm-4">
                    <a href="/mirror/" data-passthru={true} className="btn glyphicon glyphicon-globe big-icon"></a>
                    <h3>Mirrors</h3>
                    <p className="lead">Download@NUS also hosts some mirrors for various open-source projects</p>
                    <a href="/mirror/" data-passthru={true}>More...</a>
                </div>
            </div> 
        </div>  
    );
  }
});
