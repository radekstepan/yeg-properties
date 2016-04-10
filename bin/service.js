#!/usr/bin/env node
"use strict";

let args = require('minimist');
let polo = require('polo');

let name = require('../package.json').name;
let service = require('../service/index.js');

let opts = args(process.argv.slice(2), {
  'alias': {
    'p': 'port',
    'd': 'dev'
  },
  'default': {
    'p': 8090,
    'd': false
  }
});

service(opts.dev, opts.port, (port) => {
  console.log(`Service ${name} started on port ${port}.`);
  polo().put({ name, port });
});
