import React from 'react';
import cls from 'classnames';

// Fontello icon hex codes.
let codes = {
  'spin': '\e800', // Fontelico - spin6
  'heart': '\e801' // Font Awesome - heart
};

export default React.createClass({

  displayName: 'Icon.jsx',

  render() {
    let { name, className } = this.props;

    if (name && name in codes) {
      let code = parseInt(codes[name], 16);
      return (
        <span
          className={cls('icon', { [`${name}`]: true, [`${className}`]: !!className })}
          dangerouslySetInnerHTML={{ '__html': `&#${code};` }}
        />
      );
    }

    return false;
  }

});
