import state from '../state';
import aboutCmpnt from '../components/about';

export default (callback) => {
  // always start a progress bar if there is any async
  // behaviour loading the content.
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;

  aboutCmpnt(() => {
    if (state.latestPageRequestId === localPageRequestId) {
      window.Progress.done();
    }

    if (callback) callback();
  });
};
