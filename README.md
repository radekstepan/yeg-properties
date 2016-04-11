#*wip* yeg-properties

Property assessment data for Edmonton in React/Redux & Falcor with ElasticSearch and PouchDB backend.

##Commands

```bash
$ curl -XDELETE 'http://localhost:9200/yeg_property/'
$ esbulk -index yeg_property -type property output.json
```

##Falcor

https://auth0.com/blog/2015/08/28/getting-started-with-falcor/

https://netflix.github.io/falcor/documentation/model.html#The-Model-Cache

```js
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ 'extended': false }))
```

##ElasticSearch

Result window is too large, from + size must be less than or equal to: [10000] but was [100010]. See the scroll api for a more efficient way to request large data sets. This limit can be set by changing the [index.max_result_window] index level parameter.

Scrolling is not intended for real time user requests, but rather for processing large amounts of data, e.g. in order to reindex the contents of one index into a new index with a different configuration.
