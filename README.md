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

These are some of the features/optimizations one could do.

###Falcor
- To **bootstrap** data on the client one can preset model with an initial cache.
- In environments that require **near real-time** data updates, model cache can be set to size 0 OR a custom request scheduler can be written.
- Falcor handles **many to many** references using `falcor.ref`.
- Custom **functions** can be mapped to routes for actions such as entity adding and removal.
- As for **security**, `Headers` can be passed to `Falcor.HttpDataSource` and on the service side say JWT in Express can be used; e.g.: https://auth0.com/docs/quickstart/backend/falcor

###React
1. `PureRenderMixin` tells React that the output of a component will be the same for the same inputs.
1. `shouldComponentUpdate` custom logic deciding if a re-render should happen when inputs change.
