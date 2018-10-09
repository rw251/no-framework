import state from '../state';
import aboutCmpnt from '../components/about';
import api from '../api';
import { updateActive } from './common';

export default (callback) => {
  // always start a progress bar if there is any async
  // behaviour loading the content.
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;

  api.getAbout().then((data) => {
    if (state.latestPageRequestId === localPageRequestId) {
      window.Progress.done();

      // update active
      updateActive('nav-tab-2');

      document.getElementById('main').innerHTML = aboutCmpnt(data);

      if (callback) callback();
    }
  });
};
