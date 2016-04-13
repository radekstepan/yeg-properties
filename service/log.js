"use strict";

let c = require('colors/safe');
let _ = require('lodash');

module.exports = (action, cb) => {
  return (pathSet) => {
    let out;
    if (_.isArray(pathSet)) {
      out =_.map(pathSet.slice(1, 4), (part) => {
        return _.isArray(part) ? part.join(',') : part;
      });
    } else {
      out = pathSet.properties;
    }

    switch (action) {
      case 'GET':
        console.log(c.green('GET'), out);
        break;
      case 'SET':
        console.log(c.yellow('SET'), out);
        break;
      case 'CALL':
        console.log(c.blue('CALL'), out);
        break;
    }

    return cb(pathSet);
  };
};
