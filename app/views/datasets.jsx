/**
 * @jsx React.DOM
 */
var React = require('react-tools').React;

var searchform = require("./searchform.jsx");

module.exports = React.createClass({
  render: function() {
    var pagesNum = [];
    for(var i = 1; i <= this.props.pages; i++){
        pagesNum.push(i);
    }
    var session = this.props.session;
    return (
        <div>
            <table className="table table-striped">
            <tbody>
                <tr>
                    <th className="col-lg-1 col-sm-1">
                        #
                    </th>
                    <th className="col-lg-4 col-sm-4">
                        Description
                    </th>
                    <th className="col-lg-1 col-sm-1">
                        Download
                    </th>
                    <th className="col-lg-1 col-sm-1">
                        Category
                    </th>
                    <th className="col-lg-2 col-sm-2">
                        Uploader
                    </th>
                    <th className="col-lg-2 col-sm-2">
                        Date
                    </th>
                    <th className="col-lg-1 col-sm-1">
                        Action
                    </th>
                </tr>
                {this.props.datasets && this.props.datasets.map(function(data, ind){
                    return (
                    <tr>
                        <td>{ ind + 1 }</td>
                        <td>
                            <p><strong>{ data.name }</strong></p>
                            <p>{ data.description }</p>
                        </td>
                        <td>
                            { data.dataFiles.map(function(file){
                                    return <a data-passthru="true" href={"repo/" + file.filepath} className="btn btn-sm btn-primary" style={{textTransform:"uppercase"}}>{ file.filepath.split(".").pop() }</a>
                               })
                            }
                        </td>
                        <td>{ data.dataCategory.name }</td>
                        <td>{ data.user.name }</td>
                        <td>{ data.formatedUpdatedAt }</td>
                        <td>
                            <a href={"/data/" + data.id} type="button" className="btn btn-default btn-sm btn-info">
                                <span className="glyphicon glyphicon-new-window">{' '}</span>
                            </a> {' '}
                            { (data.user.nusId === (session && session.nusId)) ? 
                                <a href={"/data/" + data.id + "?edit"} type="button" className="btn btn-sm btn-primary">
                                    <span className="glyphicon glyphicon-pencil"></span>
                                </a> : null
                            }
                        </td>
                    </tr>
                    )
                })
                }
            </tbody>
            </table>
            {
                (!this.props.datasets || !this.props.datasets.length) ?
                <p className="text-center">There is nothing here</p> : null
            }
            {
                this.props.page ?
                <div className="text-center">
                    <ul className="pagination">
                        {
                            this.props.page > 1 ?
                            <li><a href={"?page=" +  (page-1)}>&laquo;</a></li> :
                            <li className="disabled"><a>&laquo;</a></li>
                        }
                        {
                            pagesNum.map(function(i){
                                return <li className={i === page ? "active" : ""}><a href={"?page=" + i}>{i}</a></li>
                            })
                        }
                        {
                            this.props.page < this.props.pages ? 
                            <li><a href={"?page=" + (page+1)}>&raquo;</a></li> :
                            <li className="disabled"><a>&raquo;</a></li>
                        }
                    </ul>
                </div> : null
            }
        </div>  
    );
  }
});
