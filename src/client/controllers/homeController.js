import state from '../state';
import api from '../api';
import { updateActive } from './common';
import homeCmpnt from '../components/home';

export default (callback) => {
  // always start a progress bar if there is any async
  // behaviour loading the content.
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;

  api.getHome().then((data) => {
    if (state.latestPageRequestId === localPageRequestId) {
      window.Progress.done();

      updateActive('nav-tab-1');

      document.getElementById('main').innerHTML = homeCmpnt(data);
    }

    if (callback) callback();
  });
};
