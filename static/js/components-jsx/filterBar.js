/** @jsx React.DOM */
(function(Dan){
    "use strict";

    Dan.filterBar = React.createClass({
        render: function() {
            return (
                <div className='filter-bar'>
                    <input type='search' placeholder="Search..." ref="searchInput" />
                    <select onChange={this.filterChanged} ref="category">
                        <option />
                        {this.props.categories.map(function(c){
                            return <option value={c.value}>{c.name}</option>
                        })}
                    </select>
                </div>
            );
        },
        componentDidMount: function() {
            var searchInput = this.refs.searchInput.getDOMNode();
            searchInput.focus();
            $(searchInput).on("search", this.filterChanged);
        },
        filterChanged: React.autoBind(function(){
            if(this.props.onFilterChange){
                this.props.onFilterChange({
                    text: this.refs.searchInput.getDOMNode().value.trim(),
                    category: this.refs.category.getDOMNode().value.trim()
                });
            }
        })
    });
})(window.Dan ? window.Dan : window.Dan = {});