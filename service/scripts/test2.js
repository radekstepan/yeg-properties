"use strict";

let elasticsearch = require('elasticsearch');

let client = new elasticsearch.Client({
  'host': 'localhost:9200'
});

client.search({
  'index': 'yeg_property',
  'body': {
    'query': {
      'match': {
        'street_name': '104 Ave'
      }
    }
  },
  'size': 1e4
}, (err, res) => {
  console.log(res.hits.hits.length);
});
