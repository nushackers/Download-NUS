/**
 * @jsx React.DOM
 */
var React = require('react');

module.exports = React.createClass({
  logout: function(e){
    e.preventDefault();
    e.stopPropagation();
    var router = this.props.router;
    this.props.sessionManager.logout(function(){
        router.refresh();
    });
  },
  render: function() {
    return (
        <header className="navbar navbar-fixed-top navbar-default">
            <div className="container">
                <a className="navbar-brand" href="/">Download@NUS</a>
                <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
                <ul className="nav navbar-nav navbar-right hidden-xs">
                    {this.props.session ?  
                        [
                        <li>
                            <a href="/upload">Upload</a>
                        </li>,
                        <li className="dropdown">
                            <a data-toggle="dropdown" href="#">{ this.props.session.name + " " }<b className="caret" /></a>
                            <ul className="dropdown-menu" role="menu" aria-labelledby="dLabel">
                                <li><a href="/manage">Manage Datasets</a></li>
                                <li><a href="" data-passthru="true" onClick={this.logout}>Log out</a></li>
                            </ul>
                        </li>
                        ]:
                        <li >
                        <a href="/login">Sign In</a>
                        </li>
                    }
                </ul>
                <div className="collapse navbar-collapse navbar-ex1-collapse">
                    <ul className="nav navbar-nav">
                        <li><a href="/data">Download</a></li>
                        <li><a data-passthru={"true"} href="/mirror/">Mirrors</a></li>
                    </ul>
                    <ul className="nav navbar-nav visible-xs">
                        {this.props.session ?
                            [
                            <li><a href="/upload">Upload</a></li>,
                            <li><a href="/profile">Profile</a></li>,
                            <li><a href="/manage">Manage Datasets</a></li>,
                            <li className="divider"></li>,
                            <li><a href="" data-passthru="true" onClick={this.logout}>Log out</a></li>
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
