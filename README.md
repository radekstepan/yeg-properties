#*wip* yeg-properties

Property assessment data for Edmonton in React/Redux & Falcor with ElasticSearch and PouchDB backend.

https://data.edmonton.ca/City-Administration/Property-Assessment-Data/q7d6-ambg

##TODO
- emit events when data have updated and then pass model cache into the components; `model.getCache()`

##Commands

```bash
$ curl -XDELETE 'http://localhost:9200/yeg_property/'
$ esbulk -index yeg_property -type property output.json
```

##Falcor

https://auth0.com/blog/2015/08/28/getting-started-with-falcor/

https://netflix.github.io/falcor/documentation/model.html#The-Model-Cache

http://netflix.github.io/falcor/video-tutorials/batching-requests.html

```js
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ 'extended': false }))
```

##ElasticSearch

Result window is too large, from + size must be less than or equal to: [10000] but was [100010]. See the scroll api for a more efficient way to request large data sets. This limit can be set by changing the [index.max_result_window] index level parameter.

Scrolling is not intended for real time user requests, but rather for processing large amounts of data, e.g. in order to reindex the contents of one index into a new index with a different configuration.

##Optimizations

###Falcor
- bootstrap data on the client; set data on model cache
- near real-time data updates; set model cache size to 0 OR write your own scheduler
- many to many references; model $ref
- beyond get/set; function routes like push
- security; Headers in HttpDataSource & say JWT in Express https://auth0.com/docs/quickstart/backend/falcor

###React
1. PureRenderMixin
1. shouldComponentUpdate
