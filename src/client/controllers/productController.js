import state from '../state';
import api from '../api';
import { updateActive } from './common';
import productCmpnt from '../components/product';

export default (callback, productId, editId) => {
  // always start a progress bar if there is any async
  // behaviour loading the content.
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;
  api.getProduct(productId, editId).then((data) => {
    if (state.latestPageRequestId === localPageRequestId) {
      window.Progress.done();

      updateActive('nav-tab-4');

      document.getElementById('main').innerHTML = productCmpnt(data);
    }

    if (callback) callback();
  }, 500);
};
