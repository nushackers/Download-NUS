/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

module.exports = React.createClass({
    submit: function(e){
        e.preventDefault();
        var formData = new FormData(this.refs.form.getDOMNode());
        return $.ajax({
            url: "/api/datasets",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done(function(data){
            this.props.router.directorRouter.setRoute("/data/" + data.id);
        }).fail(function(err){
            console.log(err);
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
                        { this.props.data.categories.map(function(cat){
                            return <option value={cat.id}>{cat.name}</option>
                        }) }
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword">Class</label>
                    <select className="form-control" name="typeId" defaultValue={this.props.data.DataTypeId}>
                        { this.props.data.types.map(function(type){
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
                    <input type="file" id="file" name="file" />
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
