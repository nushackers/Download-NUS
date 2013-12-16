/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

var metaData = require("../metadata.json");

module.exports = React.createClass({
    deleteDataset: function(e){
        e.preventDefault();
        var id = this.props.data.id,
            director = this.props.router.directorRouter;
        vex.dialog.confirm({
            message: "Are you sure you want to delete this dataset? This cannot be undone!",
            callback: function(val){
                    if(val){
                        $.ajax({
                            url: "/api/datasets/" + id,
                            type: "DELETE"
                        }).done(function(){
                            director.setRoute("/manage");
                        });
                    }
                }
            });
    },
    submit: function(e){
        e.preventDefault();
        var director = this.props.router.directorRouter,
            router = this.props.router,
            tdata = this.props.data;
        var form = $(this.refs.form.getDOMNode()).serializeArray(),
            file = this.refs.fileInput.getDOMNode().files[0];

        if(!file && !this.props.data.id){
            tdata.error = {
                messages: ["Please upload a file"]
            };
            return router.render();
        }

        form.push({
            name: "onlyValidation",
            value: true
        });

        var dataid = this.props.data.id;

        $.post("/api/datasets/", form).then(function(data){
            if(data.err){
                return data;
            }
            if(file) return router.uploader.upload(file);
            else return data;
        }).then(function(data){
            if(data.err){
                return data;
            }
            form.pop();
            form.push({
                name: "ticket",
                value: data.ticket
            });
            var action;
            if(dataid){
                action = $.ajax({
                    method: "PUT",
                    url: "/api/datasets/" + dataid,
                    data: form
                });
            } else {
                action = $.post("/api/datasets", form);
            }
            return action;
        }).done(function(data){
            if(data.err){
                if(data.err instanceof Array){
                    tdata.error = {
                        messages: data.err.map(function(er){
                            return er.msg;
                        })
                    };
                } else {
                    tdata.error = {
                        messages: [data.err]
                    };
                }
                router.render();
                window.scroll(0, 0);
            } else {
                console.log(data, "data");
                router.setRouteWithData("/data/" + data.id, data);
            }
        }).fail(function(err){
            console.log(err);
        }).progress(function(p){
            router.setProgress(p);
            console.log(p);
        });
    },
    render: function() {
    return (
        <div>
        { this.props.data.id ?
            <h2>Update Dataset</h2>
            :
            <h2>Upload New Dataset</h2>
        }
        {
            this.props.data.error ?
            this.props.data.error.messages.map(function(msg){
                return (
                    <div className="alert alert-warning">
                        {msg}
                    </div>
                )
            }) : null
        }
        <form method="post" enctype="multipart/form-data" ref="form">
            <fieldset>
                <div className="form-group">
                    <label htmlFor="exampleInputEmail">Title</label>
                    <input type="text" className="form-control" id="exampleInputEmail" name="name" placeholder="Enter title" defaultValue={this.props.data.name} />
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword">Description</label>
                    <textarea className="form-control" id="exampleInputPassword" name="description" placeholder="Enter description" defaultValue={this.props.data.description}/>
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword">Category</label>
                    <select className="form-control" name="categoryId" defaultValue={this.props.data.DataCategoryId}>
                        { metaData.categories.map(function(cat){
                            return <option value={cat.id}>{cat.name}</option>
                        }) }
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword">Class</label>
                    <select className="form-control" name="typeId" defaultValue={this.props.data.DataTypeId}>
                        { metaData.types.map(function(type){
                            return <option value={type.id}>{type.name}</option>
                        }) }
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="file">Dataset</label>
                    {this.props.data.id ?
                        <div className="alert alert-info">
                            <p>Uploading a new file to replace the old one.</p>
                            <p>Or leave this field blank to keep the old file</p>
                        </div>
                        : null }
                    <input type="file" id="file" name="file" ref="fileInput" />
                    <p className="help-block">File types allowed: XLS, XLSX, CSV, TXT</p>
                </div>
                <button type="submit" className="btn btn-default btn-primary" onClick={this.submit}>Submit</button>
                { this.props.data.id ?
                    [' ', <button type="button" className="btn btn-default btn-danger" onClick={this.deleteDataset}>
                        <span className="glyphicon glyphicon-remove"></span>
                        Delete This Dataset
                    </button>]
                    : null }
            </fieldset>
        </form>
        </div>
    );
  }
});
