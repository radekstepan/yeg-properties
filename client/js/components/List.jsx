import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import _ from 'lodash';
import cls from 'classnames';
import numeral from 'numeral';

import actions from '../actions/appActions.js';

import Icon from './Icon.jsx';

export default React.createClass({

  displayName: 'List.jsx',

  mixins: [ PureRenderMixin ],

  _onScroll() {
    actions.emit('evt.scroll', this.refs.el.scrollTop);
  },

  _onFav(id) {
    actions.emit('list.favorite', id);
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
      let field = (item, key, format) => {
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
        let active = 'is_favorite' in item && item.is_favorite.value;
        content = (
          <div className="wrap" onClick={this._onFav.bind(this, id)}>
            {field(item, 'account_number')}
            {field(item, 'street_name')}
            {field(item, 'house_number')}
            {field(item, 'neighbourhood')}
            {field(item, 'value', '$0,0[.]00')}
            <div key="is_favorite" className="td">
              <Icon name="heart" className={cls({ active })} />
            </div>
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
