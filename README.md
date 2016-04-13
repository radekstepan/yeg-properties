#yeg-properties

Property [assessment data](https://data.edmonton.ca/City-Administration/Property-Assessment-Data/q7d6-ambg) for Edmonton in React/Flux & Falcor with ElasticSearch and PouchDB backend.

![image](https://raw.githubusercontent.com/radekstepan/yeg-properties/master/screenshot.png)

##Quickstart

```bash
$ nvm use
$ npm install
$ npm start
# Service yeg-properties started on port 8090.
```

##Architecture

To get the demo working you have to download the around 380k properties from Edmonton's Open Data Portal in JSON format and then pipe these into an ElasticSearch instance. Each `_id` needs to correspond to a position in the list.

In memory PouchDB stores meta-information about properties, such as their `is_favorite` flag.

Both data sources are exposed via a Falcor service in `service/routes`. You can get all fields for the properties, get their count and toggle the `is_favorite` flag.

A small Node.js client in `bin/client.js` shows some of the API calls that can be made, demonstrating cache consistency, request deduping and batching, some of the strengths of the Falcor framework.

A React client can be loaded by visiting the root address of the started service. One can scroll through a list of all these properties and, behind the scenes, Falcor will batch requests to the server to minimize HTTP round-trip times.

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
