"use strict";

let _ = require('lodash');
let keyBy = require('lodash.keyby');

let log = require('../log.js');

module.exports = (client, fields) => {
  return [
    {
      // Get the size of the whole list.
      'route': "properties.count",
      'get': log('GET', (pathSet) => {
        return client.count({ 'index': 'yeg_property' })
        .then((res) => {
          return {
            'path': [ 'properties', 'count' ],
            'value': res.count
          };
        }).catch((err) => {
          console.log(err);
        });
      })
    }, {
      // Get properties by their index.
      'route': `properties.byIndex[{integers:ids}][${fields.map(f => `'${f}'`).join(',')}]`,
      'get': log('GET', (pathSet) => {
        return client.mget({
          'index': 'yeg_property',
          'type': 'property',
          'body': {
            'ids': pathSet.ids
          }
        }).then((res) => {
          let docs = keyBy(res.docs, '_id');

          // For each document we ask for.
          let results = _.map(pathSet.ids, (id) => {
            let doc = docs[id];

            // 404.
            if (!doc.found) return {
              'path': [ 'properties', 'byIndex', id ],
              'value': null
            };

            // For each key we ask for.
            return _.map(pathSet[3], (key) => {
              return {
                'path': [ 'properties', 'byIndex', id, key ],
                'value': key in doc._source ? doc._source[key] : null
              };
            });
          });

          return _.flatten(results);
        }).catch((err) => {
          console.log(err);
        });
      })
    }
  ]
};
