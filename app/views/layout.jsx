/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

module.exports = React.createClass({
  render: function() {
    return (
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title>Download@NUS</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="" />
            <meta name="author" content="" />
            
            <link href="/css/bootstrap.min.css" rel="stylesheet" />
            <link href="/css/style.css" rel="stylesheet" />
            
        </head>
        <body>
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
                        {this.props.user ?  
                            [
                            <a href="/upload" className="btn btn-default btn-primary navbar-btn" href="/upload">Upload</a>,
                            <div className="btn-group">
                                <button className="btn btn-default navbar-btn dropdown-toggle"  data-toggle="dropdown" href="/login">{ user.name }<span className="caret"></span></button>
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
                            {this.props.user ?
                                [
                                <li><a href="/upload">Upload</a></li>,
                                <li><a href="/profile">Profile</a></li>,
                                <li><a href="/manage">Manage Datasets</a></li>,
                                <li class="divider"></li>,
                                <li><a href="/logout">Log out</a></li>
                                ] :
                                <li><a href="/login">Sign In</a></li>
                            }
                        </ul>
                    </div>
                </div>
            </header>
            <div className="container">
                <div className="page-header">
                    <h1><img src="/img/logo.gif" height="76" width="334" /></h1>
                </div>

                <div id="view-container">
                  {this.props.children}
                </div>

                <div style={{height:"1px"}}></div>
                    <hr />
                <div className="footer">
                    &copy; Copyright 2013 National University of Singapore. All Rights Reserved.
                </div>
            </div>

            <script src="/scripts.js"></script>
        </body>
    </html>
    );
  }
});

