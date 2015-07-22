/**
 * @jsx React.DOM
 */
var React = require('react');

var searchform = require("./searchform.jsx"),
    datasets = require("./datasets.jsx");

var metaData = require("../metadata.json");

module.exports = React.createClass({
  render: function() {
    return (
        <div>
            <h2>Dataset Directory</h2>

            <div className="row">
                <div className="col-lg-4 col-sm-4">
                    <p>Browse by category:</p>
                    <div className="list-group">
                        {
                            metaData.categories.map(function(cat) {
                                return <a href={"?cat=" + cat.id} className="list-group-item">{cat.name}</a>
                            })
                        }
                    </div>
                </div>
                <div className="col-lg-4 col-sm-4">
                    <p>Browse by data class:</p>
                    <div className="list-group">
                        {
                            metaData.types.map(function(t) {
                                return <a href={"?type=" + t.id} className="list-group-item">{t.name}</a>
                            })
                        }
                    </div>
                </div>
            </div>
            <datasets datasets={this.props.data.datasets} pages={this.props.data.pages} page={this.props.data.page} session={this.props.session}/>
        </div>
    );
  }
});
