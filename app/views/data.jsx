/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

var searchform = require("./searchform.jsx"),
    datasets = require("./datasets.jsx");

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
                            this.props.categories.map(function(cat) {
                                return <a href={"?cat=" + cat.id} className="list-group-item">{cat.name}</a>
                            })
                        }
                    </div>
                </div>
                <div className="col-lg-4 col-sm-4">
                    <p>Browse by data className:</p>
                    <div className="list-group">
                        {
                            this.props.types.map(function(t) {
                                return <a href={"?type=" + t.id} className="list-group-item">{t.name}</a>
                            })
                        }
                    </div>
                </div>
                <datasets datasets={this.props.datasets} pages={this.props.pages} page={this.props.page}/>
            </div>
        </div>
    );
  }
});
