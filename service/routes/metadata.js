"use strict";

let _ = require('lodash');
let keyBy = require('lodash.keyby');

let log = require('../log.js');

module.exports = (client, fields) => {
  // Get docs by id.
  let getDocs = (ids) => {
    return client.allDocs({
      'keys': ids.map(id => id.toString()),
      'include_docs': true
    });
  };

  return [
    {
      // Toggle favorite.
      'route': 'properties.byIndex[{integers:ids}].favorite',
      'call': log('CALL', (pathSet) => {
        let keys = pathSet.ids.map(id => id.toString());

        // Get all docs.
        return getDocs(keys).then((res) => {
          let docs = keyBy(res.rows, 'key');

          // Create a bulk set/update.
          let bulk = _.map(keys, (key) => {
            // Create a new document if it does not exist already.
            if (docs[key].error == 'not_found') {
              return _.extend({ '_id': key }, { 'is_favorite': true });
            // Update an existing document.
            } else {
              if ('is_favorite' in docs[key].doc) {
                return _.extend(docs[key].doc, { 'is_favorite': !docs[key].doc.is_favorite });
              } else {
                return _.extend(docs[key].doc, { 'is_favorite': true });
              }
            }
          });


          // Create/update docs in bulk.
          return client.bulkDocs(bulk).then((res) => {
            res = keyBy(res, 'id');

            // Then format the result as a graph.
            return _.map(bulk, (doc) => {
              // Action successful.
              if (doc._id in res && res[doc._id].ok) {
                return {
                  'path': [ 'properties', 'byIndex', doc._id, 'is_favorite' ],
                  'value': doc.is_favorite
                };
              // Document does not exist. We don't actually check if this doc
              //  exists in ElasticSearch, so...
              } else {
                return {
                  'path': [ 'properties', 'byIndex', doc._id ],
                  'value': null
                }
              }
            });
          });
        }).catch((err) => {
          console.log(err);
        });
      })
    }, {
      // Property metadata.
      'route': `properties.byIndex[{integers:ids}][${fields.map(f => `'${f}'`).join(',')}]`,
      'set': log('SET', (pathSet) => {
        // Keys we are updating.
        let keys = _.keys(pathSet.properties.byIndex);

        // Get all documents.
        return getDocs(keys).then((res) => {
          let docs = keyBy(res.rows, 'key');

          // Create a bulk set/update.
          let bulk = _.map(keys, (key) => {
            // Create a new document if it does not exist already.
            if (docs[key].error == 'not_found') {
              return _.extend({ '_id': key }, pathSet.properties.byIndex[key]);
            // Update an existing document.
            } else {
              return _.extend(docs[key].doc, pathSet.properties.byIndex[key]);
            }
          });

          // Create/update docs in bulk.
          return client.bulkDocs(bulk).then((res) => {
            res = keyBy(res, 'id');

            // Then format the result as a graph.
            let results = _.map(bulk, (doc) => {
              // Action successful.
              if (doc._id in res && res[doc._id].ok) {
                return _.map(pathSet.properties.byIndex[doc._id], (val, key) => {
                  // What is the current value for this key?
                  return {
                    'path': [ 'properties', 'byIndex', doc._id, key ],
                    'value': key in doc ? doc[key] : null
                  };
                });
              // Document does not exist. We don't actually check if this doc
              //  exists in ElasticSearch, so...
              } else {
                return {
                  'path': [ 'properties', 'byIndex', doc._id ],
                  'value': null
                }
              }
            });

            return _.flatten(results);
          });
        }).catch((err) => {
          console.log(err);
        });
      }),
      'get': log('GET', (pathSet) => {
        let keys = _.map(pathSet.ids, id => id.toString());

        return getDocs(keys).then((res) => {
          let docs = keyBy(res.rows, 'key');

          let results = _.map(keys, (id) => {
            let doc = docs[id];

            // 404 or 500.
            if (doc.error) return {
              'path': [ 'properties', 'byIndex', id ],
              'value': doc.error == 'not_found' ? null : doc.error
            }

            return _.map(_.isArray(keys) ? keys : [ keys ], (key) => {
              return {
                'path': [ 'properties', 'byIndex', id, key ],
                'value': key in doc.doc ? doc.doc[key] : null
              };
            });
          });

          return _.flatten(results);
        }).catch((err) => {
          console.log(err);
        });
      })
    }
  ];
};
