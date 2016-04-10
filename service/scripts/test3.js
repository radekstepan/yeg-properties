"use strict";

let elasticsearch = require('elasticsearch');
let _ = require('highland');
let ndjson = require('ndjson');
let $ = require('lodash');

let client = new elasticsearch.Client({
  'host': 'localhost:9200'
});


let through = (docs) => {
  return _((push, next) => {
    let body = $(docs).map((doc) => {
      let head = {
        'index': {
          '_index': 'yeg_property',
          '_type': 'property',
          '_id': id++
        }
      };
      return [ head, doc ];
    }).flatten().value();

    client.bulk({ body }, (err, res) => {
      console.log(res);
      push(err, _.nil);
    });
  });
};

let id = 0;
let pipeline = _.pipeline(
  _(),
  ndjson.parse(),
  _.batch(1e5),
  _.map(through),
  _.series()
);

process.stdin.pipe(pipeline).pipe(process.stdout);
