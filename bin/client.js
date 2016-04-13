#!/usr/bin/env node
"use strict";

let polo = require('polo'),
    concat = require('lodash.concat');

let falcor = require('falcor'),
    HttpDataSource = require('falcor-http-datasource');

let pkg = require('../package.json');

let config = require('../service/config.json');

// All the fields we can access.
let fields = concat(config.fields.elastic, config.fields.pouch);

// Wait until we find the service.
let service = () => {
  return new Promise((resolve, reject) => {
    polo().once('up', (name, service) => {
      if (name != pkg.name) return;
      let source = new HttpDataSource(`http://${service.address}/yeg.json`);
      let model = new falcor.Model({ source });
      resolve(model);
    });
  });
};

// The meat.
service().then((model) => {
  // Get the length of the whole list.
  return model.get("properties.count")
  // Get the first 3 properties.
  .then(res => model.get([ "properties", "byIndex", { 'from': 0, 'to': 2 }, fields ]))
  // Favorite the third property.
  .then(res => model.call([ "properties", "byIndex", 2, "favorite" ]))
  // Get the 3 properties again.
  .then(res => model.get([ "properties", "byIndex", { 'from': 0, 'to': 2 }, fields ]))
  // Batch three requests.
  .then(res => {
    return new Promise((resolve, reject) => {
      let b = model.batch(100); // wait 100ms

      let results = [];

      let push = (res) => {
        results.push(res.json.properties.byIndex);
        if (results.length == 3) resolve(results);
      };

      b.get([ "properties", "byIndex", 2, fields ]).then(push);
      b.get([ "properties", "byIndex", 3, fields ]).then(push);
      b.get([ "properties", "byIndex", 4, fields ]).then(push);
    });
  });
})
// Log.
.then((res) => {
  console.log(JSON.stringify(res, null, 2));
  process.exit();
})
// Catch errors.
.catch(err => console.log(err));
