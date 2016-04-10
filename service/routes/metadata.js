"use strict";

let _ = require('lodash');
let keyBy = require('lodash.keyby');

module.exports = (client) => {
  return [
    {
      // Property metadata.
      'route': 'properties[{integers:ids}].is_favorite',
      'set': (pathSet) => {
        // Keys we are updating.
        let keys = _.keys(pathSet.properties);

        // Get all documents.
        return client.allDocs({
          'keys': keys,
          'include_docs': true
        }).then((res) => {
          let docs = keyBy(res.rows, 'key');

          // Create a bulk set/update.
          let bulk = _.map(keys, (key) => {
            // Create a new document if it does not exist already.
            if (docs[key].error == 'not_found') {
              return _.extend({ '_id': key }, pathSet.properties[key]);
            // Update an existing document.
            } else {
              return _.extend(docs[key].doc, pathSet.properties[key]);
            }
          });

          // Create/update docs in bulk.
          return client.bulkDocs(bulk).then((res) => {
            res = keyBy(res, 'id');

            // Then format the result as a graph.
            let results = _.map(bulk, (doc) => {
              // Action successful.
              if (doc._id in res && res[doc._id].ok) {
                return _.map(pathSet.properties[doc._id], (val, key) => {
                  // What is the current value for this key?
                  return {
                    'path': [ 'properties', doc._id, key ],
                    'value': key in doc ? doc[key] : null
                  };
                });
              // Document does not exist. We don't actually check if this doc
              //  exists in ElasticSearch, so...
              } else {
                return {
                  'path': [ 'properties', doc._id ],
                  'value': null
                }
              }
            });

            return _.flatten(results);
          });
        }).catch((err) => {
          console.log(err);
        });
      },
      'get': (pathSet) => {
        return client.allDocs({
          'keys': pathSet.ids.map(id => id.toString()),
          'include_docs': true
        }).then((res) => {
          let docs = keyBy(res.rows, 'key');

          let results = _.map(pathSet.ids, (id) => {
            let doc = docs[id];

            // 404 or 500.
            if (doc.error) return {
              'path': [ 'properties', id ],
              'value': doc.error == 'not_found' ? null : doc.error
            }

            let keys = pathSet[2];
            return _.map(_.isArray(keys) ? keys : [ keys ], (key) => {
              return {
                'path': [ 'properties', id, key ],
                'value': key in doc.doc ? doc.doc[key] : null
              };
            });
          });

          return _.flatten(results);
        }).catch((err) => {
          console.log(err);
        });
      }
    }
  ];
};
