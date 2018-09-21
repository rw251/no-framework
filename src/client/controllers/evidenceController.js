import Template from 'rw-templater';
import state from '../state';
import api from '../api';
import { updateActive, updateBreadcrumbs } from './common';

export default (callback, indicatorId) => {
  // always start a progress bar if there is any async
  // behaviour loading the content.
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;

  api.indicators().then((indicators) => {
    // check if the most recently requested page is this
    // otherwise do nothing.
    if (state.latestPageRequestId === localPageRequestId) {
      // ready to display content so make the progress bar complete
      window.Progress.done();

      // if navigated here via /evidence but there is already
      // a previously selected indicator, then we default to that.
      if (indicatorId) state.indicatorId = indicatorId;
      else if (state.indicatorId) {
        // changes url from /evidence to /evidence/:indicatorId but
        // ensures the history is correct. E.g. back goes to the thing
        // before /evidence
        global.Router.shift(`/evidence/${state.indicatorId}`);
      }

      // process the data from the server
      let anySelected = false;
      let noneSelected = true;
      let selectedIndicator = { info: '' };
      indicators.forEach((indicator) => {
        if (indicator._id === +state.indicatorId) {
          indicator.isSelected = true;
          anySelected = true;
          noneSelected = false;
          selectedIndicator = indicator;
        }
      });

      // selected tab and breadcrumbs
      updateActive('tab-evidence');
      const crumbs = [{ label: 'Indicator Evidence Summaries', path: '/evidence' }];
      if (indicatorId) crumbs.push({ label: selectedIndicator.short_name });
      updateBreadcrumbs(crumbs);

      // render page
      document.getElementById('page').innerHTML = Template.it('evidence', { indicators, anySelected, noneSelected, selectedIndicator });

      // wire up the bootstrap-select thing
      $('.selectpicker').selectpicker();

      // cause navigation on the select drop down changing
      document.getElementById('indicatorList').addEventListener('change', (event) => {
        if (event.target.value !== state.indicatorId) {
          global.Router.navigate(`/evidence/${event.target.value}`);
        }
      });

      if (callback) callback();
    }
  });
};
