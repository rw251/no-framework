import Template from 'rw-templater';
import state from '../state';
import api from '../api';
import { updateActive, updateBreadcrumbs } from './common';

export default (callback, practiceId, dateId, comparisonDateId, tabId) => {
  // always start a progress bar if there is any async
  // behaviour loading the content.
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;

  Promise
    .all([
      api.practices(),
      api.datesForDisplay(),
    ]).then(([practices, dates]) => {
      const comparisonDates = JSON.parse(JSON.stringify(dates.slice(1)));

      // for testing single practice uncomment this line
      // practices = [practices[0]];

      if (practices.length === 1) {
        state.practiceId = practices[0]._id;
      } else if (practiceId && practiceId !== 'undefined') {
        state.practiceId = practiceId;
      } else {
        state.practiceId = state.practiceId || 0;
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
        state.practiceTabId = tabId;
      } else if (!state.practiceTabId) {
        state.practiceTabId = 1;
      }

      // changes url from /practice to /practice/:practiceId but
      // ensures the history is correct. E.g. back goes to the thing
      // before /practice was called
      global.Router.shift(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.practiceTabId}`);

      api.summary(state.practiceId, state.dateId, state.comparisonDateId).then((summary) => {
        // check if the most recently requested page is this
        // otherwise do nothing.
        if (state.latestPageRequestId === localPageRequestId) {
        // ready to display content so make the progress bar complete
          window.Progress.done();

          const isSinglePractice = practices.length === 1;
          const singlePractice = practices[0];

          const tab1Active = +state.practiceTabId === 1;
          const tab2Active = +state.practiceTabId === 2;
          const tab3Active = +state.practiceTabId === 3;

          let selectedPractice;
          practices.forEach((p) => {
            if (p._id === +state.practiceId) {
              p.isSelected = true;
              selectedPractice = p;
              state.practiceName = p.short_name;
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

          updateActive('tab-practice');
          const crumbs = selectedPractice
            ? [{ label: selectedPractice.short_name }]
            : [{ label: 'Single Practice', path: '/practice' }];
          updateBreadcrumbs(crumbs);

          const filterBarHtml = Template.it('filterBarPractice', {
            practices,
            singlePractice,
            isSinglePractice,
            selectedPractice,
            selectedDate,
            selectedComparisonDate,
            dates,
            comparisonDates,
          });

          const practiceHtml = selectedPractice
            ? Template.it('practiceContent', {
              tab1Active,
              tab2Active,
              tab3Active,
              summary,
            })
            : '';

          document.getElementById('page').innerHTML = filterBarHtml + practiceHtml;

          $('.tooltip').tooltip('hide');
          $('[data-toggle="tooltip"]').tooltip();

          // wire up the bootstrap-select thing
          $('.selectpicker').selectpicker();

          // cause navigation on the select drop down changing
          const practiceList = document.getElementById('practiceList');
          if (practiceList) {
            practiceList.addEventListener('change', (event) => {
              if (event.target.value !== state.practiceId) {
                global.Router.navigate(`/practice/${event.target.value}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.practiceTabId}`);
              }
            });
          }
          document.getElementById('dateList').addEventListener('change', (event) => {
            if (event.target.value !== state.dateId) {
              global.Router.navigate(`/practice/${state.practiceId}/date/${event.target.value}/comparedWith/${state.comparisonDateId}/tab/${state.practiceTabId}`);
            }
          });
          document.getElementById('dateCompareList').addEventListener('change', (event) => {
            if (event.target.value !== state.comparisonDateId) {
              global.Router.navigate(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${event.target.value}/tab/${state.practiceTabId}`);
            }
          });

          $('li a[role="tab"]').on('shown.bs.tab', (e) => {
            state.practiceTabId = $(e.currentTarget).data('id');
            global.Router.shift(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.practiceTabId}`, true);
          });
        }

        if (callback) callback();
      });
    });
};
