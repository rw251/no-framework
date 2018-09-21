import Template from 'rw-templater';
import state from '../state';
import { updateActive, updateBreadcrumbs } from './common';

export default (callback) => {
  state.latestPageRequestId = Math.random();
  window.Progress.done();

  updateActive('tab-help');
  updateBreadcrumbs([{ label: 'Contact / Help' }]);

  document.getElementById('page').innerHTML = Template.it('help');

  if (callback) callback();
};
