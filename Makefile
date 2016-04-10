WATCHIFY   = ./node_modules/.bin/watchify
WATCH      = ./node_modules/.bin/watch
LESS       = ./node_modules/.bin/lessc
BROWSERIFY = ./node_modules/.bin/browserify
UGLIFY     = ./node_modules/.bin/uglifyjs
CLEANCSS   = ./node_modules/.bin/cleancss

BIN        = ./bin/run.js

NAME       = $(shell node -e "console.log(require('./package.json').name)")

start:
	${BIN}

start-dev:
	${BIN} --dev

watch-js: build-js
	${WATCHIFY} -e -s $(NAME) ./client/js/index.jsx -t babelify -o service/public/js/bundle.js -d -v

watch-css: build-css
	${WATCH} "${MAKE} build-css" client/less

watch:
	${MAKE} watch-js & ${MAKE} watch-css

build-js:
	${BROWSERIFY} -e -s $(NAME) ./client/js/index.jsx -t babelify > service/public/js/bundle.js

build-css:
	${LESS} client/less/app.less > service/public/css/bundle.css

build: build-js build-css

minify-js:
	${UGLIFY} service/public/js/bundle.js > service/public/js/bundle.min.js

minify-css:
	${CLEANCSS} service/public/css/bundle.css > service/public/css/bundle.min.css
