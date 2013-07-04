/** @jsx React.DOM */
(function(Dan){
    "use strict";

    Dan.bundleItem = React.createClass({
        render: function() {
            return (
                <li>
                    <div className={"icon " + this.props.data.type}>
                        <div className="type">{this.props.data.type}</div>
                    </div>
                    <div className="heading">
                        <div className="name">{this.props.data.name}</div>
                        <div className="category">{this.props.data.category}</div>
                    </div>
                    <div className='content'>
                        <div className="description">{this.props.data.description}</div>
                    </div>
                    <div className='footer'>
                        Upload by <span className='uploader'>{this.props.data.uploader}</span>
                        in <span className='date'>{this.props.data.lastUpdate}</span>
                    </div>
                </li>
            );
        }
    });
})(window.Dan ? window.Dan : window.Dan = {});