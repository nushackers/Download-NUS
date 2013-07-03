/** @jsx React.DOM */
(function(Dan){
    "use strict";

    var bundleList = Dan.bundleList;
    Dan.bundleView = React.createClass({
        getInitialState: function() {
            return {
                loading: false,
                data: []
            };
        },
        receivedData: React.autoBind(function(data){
            this.setState({
                data: data,
                loading: false
            });
        }),
        componentWillReceiveProps: function(nextProps) {
            if(nextProps.filter && nextProps.filter !== this.props.filter){
                this.loader && this.loader.reject({
                    isCancel: true
                });
                this.setState({
                    loading: true,
                    data: []
                });
                this.loader = this.props.updateData(nextProps.filter).done(this.receivedData);
            }
        },
        render: function() {
            return (
                <div>
                    <bundleList data={this.state.data} />
                    {this.state.data.length === 0 && !this.state.loading ? 
                        <div class="noItem">Nothing here yet...</div> : <div></div>
                    }
                    <div className={"loading" + (this.state.loading ? "" : " hidden")} />
                </div>
            );
        }
    });
})(window.Dan ? window.Dan : window.Dan = {});