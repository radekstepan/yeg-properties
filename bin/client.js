#!/usr/bin/env node
"use strict";

let polo = require('polo');

let falcor = require('falcor'),
    HttpDataSource = require('falcor-http-datasource');

let pkg = require('../package.json');

let fields = [ "neighbourhood", "street_name", "house_number", "value", "is_favorite" ];

// Wait until we find the service.
let service = new Promise((resolve, reject) => {
  polo().once('up', (name, service) => {
    if (name != pkg.name) return;
    let source = new HttpDataSource(`http://${service.address}/yeg.json`);
    let model = new falcor.Model({ source });
    resolve(model);
  });
});

// The meat.
service.then((model) => {
  return model.get("properties.count")
  // Get the first 3 properties.
  .then(res => model.get([ "properties", { 'from': 0, 'to': 2 }, fields ]))
  // Favorite the second property.
  .then(res => model.setValue([ "properties", 2, "is_favorite" ], "Y"))
  // Get the 3 properties again.
  .then(res => model.get([ "properties", { 'from': 0, 'to': 2 }, fields ]))
  // Batch three requests.
  .then(res => {
    return new Promise((resolve, reject) => {
      let b = model.batch(100); // wait 100ms

      let results = [];

      let push = (res) => {
        results.push(res.json.properties);
        if (results.length == 2) resolve(results);
      };

      b.get([ "properties", 2, fields ]).then(push);
      b.get([ "properties", 3, fields ]).then(push);
      b.get([ "properties", 4, fields ]).then(push);
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
