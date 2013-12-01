/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

var searchform = require("./searchform.jsx"),
    datasets = require("./datasets.jsx");

module.exports = React.createClass({
    login: function(e){
        e.preventDefault();
        $.ajax({
            url: "/api/login",
            data: $(this.refs.form.getDOMNode()).serialize(),
            dataType: "json",
            type: "POST"
        }).done(function(data){
            console.log(data);
            if(data.err){
                this.setState({
                    messages: [data.err]
                });
            } else {
                this.props.router.updateSession(data.user);
                this.props.router.directorRouter.setRoute("/");
            }
        }.bind(this));
    },
    render: function() {
        return (
            <div className="row">
                <div className="col-lg-3"></div>
                <div className="col-lg-6">
                    <div className="panel">
                        <form action="/api/login" method="post" onSubmit={this.login} ref="form">
                            <fieldset>
                                <legend>Sign In</legend>
                                {
                                    this.state && this.state.messages ? this.state.messages.map(function(m){ 
                                    return <div className="alert alert-danger">
                                                {m}
                                            </div>
                                    }) : null
                                }
                                <div className="form-group row">
                                    <div className="col-lg-4 col-sm-4">
                                        <label htmlFor="domain">Domain</label>
                                        <select className="form-control" id="domain" name="domain">
                                            <option value="nusstu">NUSSTU</option>
                                            <option value="nusstf">NUSSTF</option>
                                            <option value="nusext">NUSEXT</option>
                                        </select>
                                    </div>
                                    <div className="col-lg-8 col-sm-8">
                                        <label htmlFor="nusId">NUSNET ID</label>
                                        <input type="text" className="form-control" id="nusId" name="username" placeholder="A0XXXXXX" name="nusId" />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <div className="col-lg-12 col-sm-12">
                                        <label htmlFor="password">Password</label>
                                        <input type="password" className="form-control" id="password" placeholder="Password" name="password" />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <div className="col-lg-12 col-sm-12">
                                            <button type="submit" className="btn btn-default pull-right">Sign In</button>
                                    </div>
                                </div>
                            </fieldset>
                        </form> 
                    </div>
                </div>
                <div className="col-lg-3"></div>
            </div>
        );
    }
});
