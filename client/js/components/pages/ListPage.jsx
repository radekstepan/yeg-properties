import React from 'react';
import _ from 'lodash';
import numeral from 'numeral';
import cls from 'classnames';

import actions from '../../actions/appActions.js';

import Page from '../../lib/PageMixin.js';

import List from '../List.jsx';
import Icon from '../Icon.jsx';

export default React.createClass({

  displayName: 'ListPage.jsx',

  mixins: [ Page ],

  render() {
    let { app } = this.state;

    // Loading icon.
    let icon = <Icon name="spin" className={cls({ 'active': app.system.loading })} />;

    // Table head field generator.
    let field = (key) => <div key={key} className="td">{key}</div>;

    return (
      <div>
        <div id="header">
          <div className="wrap">
            {icon}
            <div className="logo" />
            <div className="title">Property Assessment Data</div>
          </div>
          <div className="thead">
            {field('account_number')}
            {field('street_name')}
            {field('house_number')}
            {field('neighbourhood')}
            {field('value')}
          </div>
        </div>
        <List {...app} />
      </div>
    );
  }

});
