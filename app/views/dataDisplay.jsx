/**
 * @jsx React.DOM
 */
var React = require('react-tools').React,
    marked = require("marked"),
    dateFormat = require('dateformat'),
    path = require("path");

marked.setOptions({
    gfm: true,
    highlight: function (code, lang, callback) {
        return code;
    },
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    langPrefix: 'lang-'
});

module.exports = React.createClass({
  render: function() {
    var updatedTime = dateFormat(this.props.data.updatedAt, "d mmmm yyyy");
    return (
        <div className="panel panel-default">
            <header className="panel-heading">
                <h1>{ this.props.data.name }</h1>
                <dl className="dl-horizontal">
                    <dt>Uploaded by: </dt>
                    <dd>{ this.props.data.user.name }</dd>

                    <dt>Last update: </dt>
                    <dd>{ updatedTime }</dd>

                    <dt>Category: </dt>
                    <dd>In { this.props.data.dataCategory.name }</dd>
                </dl>
            </header>
            <ul className="list-group">
                <li className="list-group-item" dangerouslySetInnerHTML={{__html: marked(this.props.data.description)}} />
                <li className="list-group-item">
                    <p> Download: </p>
                    {this.props.data.dataFiles.map(function(file){
                        return <a href={"repo/" + file.filepath} className="btn btn-sm btn-primary" data-passthru="true" style={{textTransform: "uppercase"}}>{ path.extname(file.filepath).substr(1) }</a>
                    })}
                </li>
            </ul>
            {(this.props.data.user.nusId === (this.props.session && this.props.session.nusId)) ?
                <div className="panel-footer">
                    <a href={"/data/" + this.props.data.id + "?edit"} type="button" className="btn btn-default btn-sm btn-primary">
                        <span className="glyphicon glyphicon-pencil"></span> Edit
                    </a>
                </div> : null
            }
        </div>
    );
  }
});
