import state from '../state';
import { updateActive } from './common';

export default (callback) => {
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;
  setTimeout(() => {
    if (state.latestPageRequestId === localPageRequestId) {
      window.Progress.done();

      updateActive('tab-ccg');

      document.getElementById('page').innerHTML = 'CCG';
    }

    if (callback) callback();
  }, 1500);
};
