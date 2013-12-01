/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

module.exports = React.createClass({
  render: function() {
    return (
        <header className="navbar navbar-inverse navbar-fixed-top">
            <div className="container">
                <a className="navbar-brand" href="/">Download@NUS</a>
                <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
                <div className="nav navbar-nav pull-right hidden-xs">
                    {this.props.session ?  
                        [
                        <a href="/upload" className="btn btn-default btn-primary navbar-btn" href="/upload">Upload</a>,
                        <div className="btn-group">
                            <button className="btn btn-default navbar-btn dropdown-toggle"  data-toggle="dropdown" href="/login">{ this.props.session.name }<span className="caret"></span></button>
                            <ul className="dropdown-menu pull-right" role="menu" aria-labelledby="dLabel">
                                <li><a href="/manage">Manage Datasets</a></li>
                                <li className="divider"></li>
                                <li><a href="/logout">Log out</a></li>
                            </ul>
                        </div>
                        ]:
                        <a href="/login" className="btn btn-default navbar-btn">Sign In</a>
                    }
                </div>
                <div className="collapse navbar-collapse navbar-ex1-collapse">
                    <ul className="nav navbar-nav">
                        <li><a href="/data">Download</a></li>
                        <li><a href="/mirror/">Mirrors</a></li>
                    </ul>
                    <ul className="nav navbar-nav visible-xs">
                        {this.props.session ?
                            [
                            <li><a href="/upload">Upload</a></li>,
                            <li><a href="/profile">Profile</a></li>,
                            <li><a href="/manage">Manage Datasets</a></li>,
                            <li className="divider"></li>,
                            <li><a href="/logout">Log out</a></li>
                            ] :
                            <li><a href="/login">Sign In</a></li>
                        }
                    </ul>
                </div>
            </div>
        </header>
    );
  }
});
