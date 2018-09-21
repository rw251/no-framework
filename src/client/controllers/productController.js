import Template from 'rw-templater';
import state from '../state';

export default (callback, productId, editId) => {
  // always start a progress bar if there is any async
  // behaviour loading the content.
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;
  setTimeout(() => {
    if (state.latestPageRequestId === localPageRequestId) {
      window.Progress.done();
      document.querySelector('a.active').classList.remove('active');
      document.querySelector('#nav-tab-4').classList.add('active');

      document.getElementById('main').innerHTML = Template.it('products', {
        productId,
        editId,
        isFruit: Math.random() > 0.5,
        fruit: [
          { name: 'apples', colour: 'green' },
          { name: 'oranges', colour: 'orange' },
          { name: 'bananas', colour: 'yellow' },
        ],
        isCars: Math.random() > 0.5,
        cars: [
          { name: 'mini', speed: 'slow' },
          { name: 'civic', speed: 'medium' },
          { name: 'porsche', speed: 'fast' },
        ],
      });
    }

    if (callback) callback();
  }, 500);
};
