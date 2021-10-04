import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import Router from '../imports/ui/Router';
import reducers from '../imports/ui/redux/reducers';

Meteor.startup(() => {
  render(
    <Provider store={createStore(reducers)}>
      <Router />
    </Provider>,
    document.getElementById('render-target')
  );
});
