import Template from 'rw-templater';
import state from '../state';
import api from '../api';
import { updateActive, updateBreadcrumbs } from './common';

export default (callback, dateId, comparisonDateId, tabId, indicatorId) => {
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;

  api.datesForDisplay().then((dates) => {
    const comparisonDates = JSON.parse(JSON.stringify(dates.slice(1)));

    if (indicatorId && indicatorId !== 'undefined') {
      state.indicatorId = indicatorId;
    } else {
      state.indicatorId = state.indicatorId || 0;
    }

    if (dateId && dateId !== 'undefined') {
      state.dateId = dateId;
    } else if (!state.dateId) {
      state.dateId = dates[0]._id;
    }

    if (comparisonDateId && comparisonDateId !== 'undefined') {
      state.comparisonDateId = comparisonDateId;
    } else if (!state.comparisonDateId) {
      state.comparisonDateId = comparisonDates.filter(d => d.value.indexOf('30 days') > -1)[0]._id;
    }

    if (tabId && tabId !== 'undefined') {
      state.ccgTabId = tabId;
    } else if (!state.ccgTabId) {
      state.ccgTabId = 1;
    }

    global.Router.shift(`/ccg/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.ccgTabId}/indicator/${state.indicatorId}`);

    Promise
      .all([
        api.indicators(),
        api.ccgSummary(state.indicatorId, state.dateId, state.comparisonDateId),
      ]).then(([indicators, summary]) => {
        if (state.latestPageRequestId === localPageRequestId) {
          window.Progress.done();

          const tab1Active = +state.ccgTabId === 1;
          const tab2Active = +state.ccgTabId === 2;

          let selectedIndicator;
          indicators.forEach((p) => {
            if (p._id === +state.indicatorId) {
              p.isSelected = true;
              selectedIndicator = p;
              state.indicatorName = p.short_name;
            } else {
              delete p.isSelected;
            }
          });

          let selectedDate;
          dates.forEach((d) => {
            if (d._id === +state.dateId) {
              d.isSelected = true;
              selectedDate = d;
            } else {
              delete d.isSelected;
            }
            d.shouldDisplay = d.value.indexOf('day') < 0;
          });

          let selectedComparisonDate;
          comparisonDates.forEach((c) => {
            if (c._id === +state.comparisonDateId) {
              c.isSelected = true;
              selectedComparisonDate = c;
            }
            c.shouldDisplay = c._id < +state.dateId;
          });

          updateActive('tab-ccg');
          const crumbs = [
            { label: 'All Practices' },
          ];
          updateBreadcrumbs(crumbs);


          const filterBarHtml = Template.it('filterBarCcg', {
            indicators,
            selectedIndicator,
            selectedDate,
            selectedComparisonDate,
            dates,
            comparisonDates,
          });

          const ccgeHtml = Template.it('ccgContent', {
            tab1Active,
            tab2Active,
            summary,
          });

          document.getElementById('page').innerHTML = filterBarHtml + ccgeHtml;

          $('.tooltip').tooltip('hide');
          $('[data-toggle="tooltip"]').tooltip();

          // wire up the bootstrap-select thing
          $('.selectpicker').selectpicker();

          // cause navigation on the select drop down changing
          document.getElementById('indicatorList').addEventListener('change', (event) => {
            if (event.target.value !== state.indicatorId) {
              global.Router.navigate(`/ccg/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.ccgTabId}/indicator/${event.target.value}`);
            }
          });
          document.getElementById('dateList').addEventListener('change', (event) => {
            if (event.target.value !== state.dateId) {
              global.Router.navigate(`/ccg/date/${event.target.value}/comparedWith/${state.comparisonDateId}/tab/${state.ccgTabId}/indicator/${state.indicatorId}`);
            }
          });
          document.getElementById('dateCompareList').addEventListener('change', (event) => {
            if (event.target.value !== state.comparisonDateId) {
              global.Router.navigate(`/ccg/date/${state.dateId}/comparedWith/${event.target.value}/tab/${state.ccgTabId}/indicator/${state.indicatorId}`);
            }
          });

          $('li a[role="tab"]').on('shown.bs.tab', (e) => {
            state.ccgTabId = $(e.currentTarget).data('id');
            global.Router.shift(`/ccg/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.ccgTabId}/indicator/${state.indicatorId}`, true);
          });
        }

        if (callback) callback();
      });
  });
};
