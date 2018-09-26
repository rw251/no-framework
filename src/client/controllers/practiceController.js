import Template from 'rw-templater';
import state from '../state';
import api from '../api';
import { updateActive, updateBreadcrumbs } from './common';
import { displaySinglePracticeChart } from '../charts';

export default (callback, practiceId, dateId, comparisonDateId, tabId, chartId, sort, dir) => {
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

      if (chartId && chartId !== 'undefined') {
        state.practiceChartId = chartId;
      } else if (!state.practiceChartId) {
        state.practiceChartId = 0;
      }

      if (sort && sort !== 'undefined') {
        state.practiceSort = sort;
      } else if (!state.practiceSort) {
        state.practiceSort = 1;
      }

      if (dir && dir !== 'undefined') {
        state.practiceSortDirection = dir;
      } else if (!state.practiceSortDirection) {
        state.practiceSortDirection = 'desc';
      }

      // changes url from /practice to /practice/:practiceId but
      // ensures the history is correct. E.g. back goes to the thing
      // before /practice was called
      global.Router.shift(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.practiceTabId}/chart/${state.practiceChartId}/sort/${state.practiceSort}/dir/${state.practiceSortDirection}`);

      api.summary(state.practiceId, state.dateId, state.comparisonDateId).then((summary) => {
        // check if the most recently requested page is this
        // otherwise do nothing.
        if (state.latestPageRequestId === localPageRequestId) {
        // ready to display content so make the progress bar complete
          window.Progress.done();


          // test for no multiple
          // summary.summaryData.multiple = 0;

          const isSinglePractice = practices.length === 1;
          const singlePractice = practices[0];

          const tab1Active = +state.practiceTabId === 1;
          const tab2Active = +state.practiceTabId === 2;
          const tab3Active = +state.practiceTabId === 3;

          const hideExportButton = !tab2Active;

          const chart1Active = +state.practiceChartId === 1;
          const chart2Active = +state.practiceChartId === 2;
          const chart3Active = +state.practiceChartId === 3;

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

          summary.tableData.forEach((item) => {
            item.isNum = !!item.num && item.num > 0;
            item.isResolved = !!item.resolved && item.resolved > 0;
            item.isExisting = !!item.existing && item.existing > 0;
            item.isNew = !!item.new && item.new > 0;
          });

          summary.isMultiple = !!summary.summaryData.multiple && summary.summaryData.multiple > 0;

          const practiceHtml = selectedPractice
            ? Template.it('practiceContent', {
              tab1Active,
              tab2Active,
              tab3Active,
              hideExportButton,
              summary,
              chart1Active,
              chart2Active,
              chart3Active,
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
                global.Router.navigate(`/practice/${event.target.value}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.practiceTabId}/chart/${state.practiceChartId}/sort/${state.practiceSort}/dir/${state.practiceSortDirection}`);
              }
            });
          }
          document.getElementById('dateList').addEventListener('change', (event) => {
            if (event.target.value !== state.dateId) {
              global.Router.navigate(`/practice/${state.practiceId}/date/${event.target.value}/comparedWith/${state.comparisonDateId}/tab/${state.practiceTabId}/chart/${state.practiceChartId}/sort/${state.practiceSort}/dir/${state.practiceSortDirection}`);
            }
          });
          document.getElementById('dateCompareList').addEventListener('change', (event) => {
            if (event.target.value !== state.comparisonDateId) {
              global.Router.navigate(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${event.target.value}/tab/${state.practiceTabId}/chart/${state.practiceChartId}/sort/${state.practiceSort}/dir/${state.practiceSortDirection}`);
            }
          });
          const chart = document.getElementById('id_chart');
          if (chart) {
            chart.addEventListener('change', (event) => {
              if (event.target.value !== state.practiceChartId) {
                global.Router.navigate(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.practiceTabId}/chart/${event.target.value}/sort/${state.practiceSort}/dir/${state.practiceSortDirection}`);
              }
            });
          }

          state.tables.practiceTable = $('#indicatorTable').DataTable({
            info: false, // we don't want showing 1 to n of n
            searching: false, // we don't want a search box
            stateSave: true, // let's remember which page/sorting etc
            order: [[state.practiceSort, state.practiceSortDirection]],
            paging: false, // always want all indicators
            scrollY: '50vh',
            scrollCollapse: true,
          });

          $('#indicatorTable').on('order.dt', () => {
            // This will show: "Ordering on column 1 (asc)", for example
            const order = state.tables.practiceTable.order();
            state.practiceSort = order[0][0];
            state.practiceSortDirection = order[0][1];
            global.Router.shift(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.practiceTabId}/chart/${state.practiceChartId}/sort/${state.practiceSort}/dir/${state.practiceSortDirection}`, true);
          });

          const addStartEndDateListeners = () => {
            const endDateElement = document.getElementById('endDate');
            if (endDateElement) {
              endDateElement.addEventListener('change', (event) => {
                if (event.target.value !== state.practiceChartEndDate) {
                  state.practiceChartEndDate = event.target.value;
                  displaySinglePracticeChart(
                    state.practiceChartId,
                    summary,
                    state.practiceChartStartDate,
                    state.practiceChartEndDate
                  );
                  addStartEndDateListeners();
                }
              });
            }

            const startDateElement = document.getElementById('startDate');
            if (startDateElement) {
              startDateElement.addEventListener('change', (event) => {
                if (event.target.value !== state.practiceChartStartDate) {
                  state.practiceChartStartDate = event.target.value;
                  displaySinglePracticeChart(
                    state.practiceChartId,
                    summary,
                    state.practiceChartStartDate,
                    state.practiceChartEndDate
                  );
                  addStartEndDateListeners();
                }
              });
            }
          };

          // add chart
          if (+state.practiceChartId) {
            setTimeout(() => {
              displaySinglePracticeChart(state.practiceChartId, summary);
              addStartEndDateListeners();
            }, 0);
          }

          const $exportButton = $('#export');

          $exportButton.on('click', () => {
            window.location = `/api/practice/${state.practiceId}/summaryfordate/${state.dateId}/comparedWith/${state.comparisonDateId}/sort/${state.practiceSort}/dir/${state.practiceSortDirection}/export`;
          });

          $('#tableTab').on('hidden.bs.tab', () => {
            $exportButton.hide(); // only want export button on table tab
          });

          $('li a[role="tab"]').on('shown.bs.tab', (e) => {
            state.practiceTabId = $(e.currentTarget).data('id');
            global.Router.shift(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.practiceTabId}/chart/${state.practiceChartId}/sort/${state.practiceSort}/dir/${state.practiceSortDirection}`, true);

            if (e.currentTarget.id === 'tableTab') {
              // ensure headers display correctly on hidden tab
              state.tables.practiceTable.columns.adjust().draw(false);
              $exportButton.show(); // only want export button on table tab
            }
          });
        }

        if (callback) callback();
      });
    });
};
