"use strict";

let falcorExpress = require('falcor-express'),
    Router = require('falcor-router'),
    express = require('express'),
    bodyParser = require('body-parser'),
    concat = require('lodash.concat'),
    fs = require('fs');

let ElasticSearch = require('elasticsearch'),
    PouchDB = require('pouchdb'),
    Memdown = require('memdown');

let properties = require('./routes/properties.js'),
    metadata = require('./routes/metadata.js');

var app = express();

app.use(bodyParser.urlencoded({ 'extended': false }));

// Databases.
let es = new ElasticSearch.Client({ 'host': 'localhost:9200' });
var pouch = new PouchDB('metadata', { 'db': Memdown });

app.use('/yeg.json', falcorExpress.dataSourceRoute((req, res) => {
  return new Router(concat(
    properties(es),
    metadata(pouch)
  ));
}));

// Static resources.
app.use('/public', express.static(`${__dirname}/public`));

// Be ready to serve un/-minified builds and index page.
let idx = (file, res) => {
  res.writeHead(200, {
    'Content-Length': file.length,
    'Content-Type': 'text/html'
  });
  res.end(file);
};
let idx_prod = fs.readFileSync(`${__dirname}/public/index.html`, 'utf8');
let idx_dev = idx_prod.replace(/bundle\.min/gm, 'bundle');

module.exports = (dev, port, cb) => {
  app.use('/', (req, res) => idx(dev ? idx_dev : idx_prod, res));

  let l = app.listen(port, () => {
    cb(l.address().port);
  });
};
