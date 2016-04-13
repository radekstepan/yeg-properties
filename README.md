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

*TODO*

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
