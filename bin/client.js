#!/usr/bin/env node
"use strict";

let polo = require('polo');

let falcor = require('falcor'),
    HttpDataSource = require('falcor-http-datasource');

let pkg = require('../package.json');

let fields = [ "neighbourhood", "street_name", "house_number", "value", "is_favorite" ];

polo().once('up', (name, service) => {
  if (name != pkg.name) return;

  let source = new HttpDataSource(`http://${service.address}/yeg.json`);
  let model = new falcor.Model({ source });

  model
  .get([ "properties", 1, fields ])
  .then((res) => {
    return model.setValue([ "properties", 1, "is_favorite" ], "Y")
    .then((res) => {
      return model.get([ "properties", { 'from': 0, 'to': 2 }, fields ])
      .then((res) => {
        console.log(JSON.stringify(res.json.properties, null, 2));
        process.exit();
      });
    })
  }).catch(err => console.log(err));
});
