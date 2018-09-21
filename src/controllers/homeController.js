import Template from 'rw-templater';
import state from '../state';

export default (callback) => {
  // always start a progress bar if there is any async
  // behaviour loading the content.
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;

  setTimeout(() => {
    if (state.latestPageRequestId === localPageRequestId) {
      window.Progress.done();
      document.querySelector('a.active').classList.remove('active');
      document.querySelector('#nav-tab-1').classList.add('active');

      document.getElementById('main').innerHTML = Template.it('home');
    }

    if (callback) callback();
  }, 1500);
};
