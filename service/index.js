"use strict";

let falcorExpress = require('falcor-express'),
    falcor = require('falcor'),
    HttpDataSource = require('falcor-http-datasource'),
    Router = require('falcor-router'),
    express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    concat = require('lodash.concat');

let ElasticSearch = require('elasticsearch'),
    PouchDB = require('pouchdb'),
    Memdown = require('memdown');

let properties = require('./routes/properties.js'),
    metadata = require('./routes/metadata.js');

let config = require('./config.json');

var app = express();

app.use(bodyParser.urlencoded({ 'extended': false }));
app.use(morgan(':method :url'));

// Databases.
let elastic = new ElasticSearch.Client({ 'host': 'localhost:9200' });
var pouch = new PouchDB('metadata', { 'db': Memdown });

app.use('/yeg.json', falcorExpress.dataSourceRoute((req, res) => {
  return new Router(concat(
    properties(elastic, config.fields.elastic),
    metadata(pouch, config.fields.pouch)
  ));
}));

// EJS template rendering.
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

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

module.exports = (isDev, port, cb) => {
  // Connection to us so we can bootstrap data.
  // TODO: make a local client.
  let source = new HttpDataSource(`http://0.0.0.0:${port}/yeg.json`);
  let model = new falcor.Model({ source });

  // All the fields we can access.
  let fields = concat(config.fields.elastic, config.fields.pouch);

  // Populate client-side cache & serve un-/minified builds.
  app.use('/', (req, res) => {
    // Get the max size of the list.
    model
    .get('properties.count')
    .then((count) => {
      count = count.json.properties.count;
      // Fetch up to first 100 items.
      model
      .get([ 'properties', 'byIndex', { 'from': 0, 'to': Math.min(100, count) }, fields ])
      .then((byIndex) => {
        byIndex = byIndex.json.properties.byIndex;
        // Render the index page with initial cache.
        let cache = { 'properties': { count, byIndex } };
        res.render('index', { isDev, 'cache': JSON.stringify(cache) });
      });
    });
  });

  let l = app.listen(port, () => {
    cb(l.address().port);
  });
};
