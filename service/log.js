"use strict";

let c = require('colors/safe');
let _ = require('lodash');

module.exports = (cb) => {
  return (pathSet) => {
    if (_.isArray(pathSet)) {
      console.log(c.green('GET'), _.map(pathSet.slice(1, 3), (part) => {
        return _.isArray(part) ? part.join(',') : part;
      }));
    } else {
      console.log(c.blue('SET'), pathSet.properties);
    }

    return cb(pathSet);
  };
};
