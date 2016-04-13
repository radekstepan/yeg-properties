import _ from 'lodash';
import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';

import Store from '../lib/Store.js';

import actions from '../actions/appActions.js';

import config from '../../config.js';

class AppStore extends Store {

  // Initial payload.
  constructor() {
    super({
      'system': {
        'loading': false
      },
      'viewport': {
        // Height of one item.
        'item': config.ITEM_HEIGHT,
        // Offset from the top (via scroll).
        'offset': 0
      }
    });

    // Listen to all app actions.
    actions.onAny((obj, event) => {
      let fn = `on.${event}`.replace(/[.]+(\w|$)/g, (m, p) => p.toUpperCase());
      // Run?
      (fn in this) && this[fn](obj);
    });

    if (!process.browser) return;

    // Debounce fetching properties.
    this.onListGet = _.debounce(this.onListGet, config.SCROLL_DEBOUNCE, { 'maxWait': config.SCROLL_DEBOUNCE * 3 });

    // Init the model connecting to our service.
    let source = new HttpDataSource(`${location.origin}/yeg.json`);
    let model = new falcor.Model({ source, 'cache': window.cache }); // eh...

    // Batch the model.
    this.model = model.batch(config.REQ_DELAY);

    // Set initial window dimensions and watch for the resize event.
    this.evtResize();
    window.addEventListener("resize", this.evtResize.bind(this));
  }

  // Merge our store data with model cache.
  getData() {
    return _.extend(this.get(), { 'cache': this.model.getCache() });
  }

  // Viewport resize event.
  evtResize() {
    let height = window.innerHeight - config.TOP_OFFSET;
    // Available space.
    this.set('viewport.height', height);
    // How many items can we show on one screen?
    this.set('viewport.count', Math.ceil(height / config.ITEM_HEIGHT));
  }

  // User emitted window scroll event.
  onEvtScroll(top) {
    this.set('viewport.offset', top);
  }

  // Fetch a range of properties by their ids.
  onListGet(ids) {
    this.model.get([ 'properties', 'byIndex', ids, [
      "account_number",
      "street_name",
      "house_number",
      "neighbourhood",
      "value"
    ]])
    .then((res) => {
      this.emit('%list_updated%');
    });
  }

  onSystemLoading(state) {
    this.set('system.loading', state);
  }

}

export default new AppStore();
