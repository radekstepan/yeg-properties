"use strict";

let _ = require('lodash');
let keyBy = require('lodash.keyby');

let log = require('../log.js');

let fields = [
  'account_number',
  'suite',
  'house_number',
  'street_name',
  'value',
  'tax_class',
  'neighbourhood',
  'has_garage',
  'lat',
  'lon'
];

module.exports = (client) => {
  return [
    {
      // Get the size of the whole list.
      'route': "properties.count",
      'get': log((pathSet) => {
        return client.count({ 'index': 'yeg_property' })
        .then((res) => {
          return {
            'path': 'properties.count',
            'value': res.count
          };
        }).catch((err) => {
          console.log(err);
        });
      })
    }, {
      // Get properties by their index.
      'route': `properties[{integers:ids}][${fields.map(f => `'${f}'`).join(',')}]`,
      'get': log((pathSet) => {
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
              'path': [ 'properties', id ],
              'value': null
            };

            // For each key we ask for.
            return _.map(pathSet[2], (key) => {
              return {
                'path': [ 'properties', id, key ],
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
