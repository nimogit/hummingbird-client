import Component from 'ember-component';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import { task, timeout } from 'ember-concurrency';
import computed from 'ember-computed';
import service from 'ember-service/inject';

export default Component.extend({
  activeTab: 'anime',
  searchQuery: '',
  media: undefined,
  numRated: 0,

  store: service(),
  session: service(),

  numRatedLeft: computed('numRated', {
    get() {
      return 5 - get(this, 'numRated');
    }
  }),

  query: task(function *() {
    const mediaType = get(this, 'activeTab');
    const data = yield get(this, 'store').query(mediaType, this._getFilters());
    set(this, 'media', data);
  }).restartable(),

  updateSearchQuery: task(function *(query) {
    set(this, 'searchQuery', query);
    yield timeout(1000);
    get(this, 'query').perform();
  }).restartable(),

  _getFilters() {
    const filters = {};
    const query = get(this, 'searchQuery');
    if (query === undefined || query === '') {
      filters.sort = '-user_count';
    } else {
      filters.filter = { text: query };
    }
    return filters;
  },

  init() {
    this._super(...arguments);
    get(this, 'query').perform();
  },

  actions: {
    changeComponent(component) {
      get(this, 'changeComponent')(component);
    },

    updateTab(tab) {
      set(this, 'activeTab', tab);
      get(this, 'query').perform();
    },

    updateContent(query) {
      get(this, 'updateSearchQuery').perform(query);
    },

    createLibraryEntry(media, rating) {
      const user = get(this, 'session.account');
      const entry = get(this, 'store').createRecord('library-entry', {
        status: 'complete',
        rating,
        user,
        media
      });
      entry.save().then(() => this.incrementProperty('numRated'));
    }
  }
});
