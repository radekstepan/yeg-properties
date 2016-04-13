import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import _ from 'lodash';
import cls from 'classnames';
import numeral from 'numeral';

import actions from '../actions/appActions.js';

export default React.createClass({

  displayName: 'List.jsx',

  mixins: [ PureRenderMixin ],

  _onScroll() {
    actions.emit('evt.scroll', this.refs.el.scrollTop);
  },

  render() {
    let { viewport, cache } = this.props;

    // Total number of items.
    let count = cache.properties.count.value;
    // Number of items offset at the top.
    let a = Math.floor(viewport.offset / viewport.item);
    // Number of items below fold.
    let b = Math.max(0, count - a - viewport.count);

    let ids = [];

    let items = _.map(_.range(Math.min(viewport.count, count - a)), (i) => {
      let field = (key, format) => {
        return (
          <div key={key} className="td">
            {format ? numeral(item[key].value).format(format) : item[key].value}
          </div>
        );
      };

      // Generate the item id (position in the list).
      let id = a + i;

      // Do we have the item already?
      let content, item;
      if (item = cache.properties.byIndex[id]) {
        content = (
          <div className="wrap">
            {field('account_number')}
            {field('street_name')}
            {field('house_number')}
            {field('neighbourhood')}
            {field('value', '$0,0[.]00')}
          </div>
        );
      // Load it then.
      } else {
        ids.push(id);
        content = <div className="loading">&hellip;</div>;
      }

      // Get these items.
      if (ids.length) {
        process.nextTick(() => {
          actions.emit('list.get', ids);
        });
      }

      return (
        <div
          key={id}
          className="item"
          style={{ 'height': `${viewport.item}px`, 'lineHeight': `${viewport.item - 1}px` }}
        >{content}</div>
      );
    });

    return (
      <div
        id="list"
        style={{ 'height': viewport.height }}
        onScroll={this._onScroll}
        ref="el"
      >
        <div style={{ 'height': `${a * viewport.item}px` }} />
        <div>{items}</div>
        <div style={{ 'height': `${b * viewport.item}px` }} />
      </div>
    );
  }

});
