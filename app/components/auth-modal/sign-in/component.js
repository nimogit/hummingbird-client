import Component from 'ember-component';
import get, { getProperties } from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';
import { task } from 'ember-concurrency';
import errorMessage from 'client/utils/error-messages';

export default Component.extend({
  identification: undefined,
  password: undefined,
  errorMessage: undefined,

  session: service(),

  authenticate: task(function *() {
    const { identification, password } = getProperties(this, 'identification', 'password');
    yield get(this, 'session')
      .authenticateWithOAuth2(identification, password)
      .then(() => get(this, 'close')())
      .catch((err) => set(this, 'errorMessage', errorMessage(err)));
  })
});
