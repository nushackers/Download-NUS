/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

module.exports = React.createClass({
  render: function() {
    return (
        <div>
            <div className="row">
                <div className="col-lg-3 col-sm-3">
                    <a href="/data" className="btn glyphicon glyphicon-save big-icon"></a>
                    <h3>Open</h3>
                    <p className="lead">Download@NUS is an open-platform. Anyone can access our collection of data.</p>
                    <a href="/data">More...</a>
                </div>
                <div className="col-lg-3 col-sm-3">
                    <a href="/upload" className="btn glyphicon glyphicon-cloud-upload big-icon"></a>
                    <h3>Community</h3>
                    <p className="lead">All data is contributed by members of the NUS research community.</p>
                    <a href="/upload">More...</a>
                </div>
                <div className="col-lg-3 col-sm-3">
                    <div className="btn glyphicon glyphicon-tower big-icon"></div>
                    <h3>Big</h3>
                    <p className="lead">Download@NUS is able to accommodate to large data sets in the magnitude of GBs.</p>
                </div>
                <div className="col-lg-3 col-sm-3">
                    <a href="/mirror/" className="btn glyphicon glyphicon-globe big-icon"></a>
                    <h3>Mirrors</h3>
                    <p className="lead">Download@NUS also hosts some mirrors for various open-source projects</p>
                    <a href="/mirror/">More...</a>
                </div>
            </div> 
        </div>  
    );
  }
});
