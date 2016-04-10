"use strict";

let fs = require('fs'),
  JSONStream = require('JSONStream'),
  transform = require('lodash/transform'),
  _ = require('highland'),
  elasticsearch = require('elasticsearch');

// let client = new elasticsearch.Client({
//   'host': 'localhost:9200',
//   'log': 'trace'
// });

let columns = {
  8: 'account_number',
  9: 'suite',
  10: 'house_number',
  11: 'street_name',
  12: 'value',
  13: 'tax_class',
  14: 'neighbourhood',
  15: 'has_garage',
  16: 'lat',
  17: 'lon'
};

let input = fs.createReadStream('./input.json', { 'encoding': 'utf8' });
let output = fs.createWriteStream('./data.ldj')

let through = _.pipeline(
  _.map((obj) => {
    return transform(obj, (res, v, i) => {
      if (i in columns) {
        if ([ ',', ' ', '"', '\n', null ].indexOf(v) !== -1) return;
        res[columns[i]] = v
      }
    }, {});
  }),
  _.map((doc) => {
    console.log(doc);
    return JSON.stringify(doc) + '\r\n';
  })
);

// Read the source file.
input
.pipe(JSONStream.parse('*'))
.pipe(through)
.pipe(output);
