import Template from 'rw-templater';
import state from '../state';
import api from '../api';
import { updateActive, updateBreadcrumbs } from './common';
import { displayCCGChart } from '../charts';

export default (callback, dateId, comparisonDateId, tabId, indicatorId, chartId) => {
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

    if (chartId && chartId !== 'undefined') {
      state.ccgChartId = chartId;
    } else if (!state.ccgChartId) {
      state.ccgChartId = 0;
    }

    global.Router.shift(`/ccg/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.ccgTabId}/indicator/${state.indicatorId}/chart/${state.ccgChartId}`);

    Promise
      .all([
        api.indicators(),
        api.ccgSummary(state.indicatorId, state.dateId, state.comparisonDateId),
      ]).then(([indicators, summary]) => {
        if (state.latestPageRequestId === localPageRequestId) {
          window.Progress.done();

          const tab1Active = +state.ccgTabId === 1;
          const tab2Active = +state.ccgTabId === 2;

          const chart1Active = +state.ccgChartId === 1;
          const chart2Active = +state.ccgChartId === 2;
          const chart3Active = +state.ccgChartId === 3;
          const chart4Active = +state.ccgChartId === 4;
          const chart5Active = +state.ccgChartId === 5;
          const chart6Active = +state.ccgChartId === 6;
          const chart7Active = +state.ccgChartId === 7;
          const chart8Active = +state.ccgChartId === 8;

          delete summary.indicator;
          let selectedIndicator;
          indicators.forEach((p) => {
            if (p._id === +state.indicatorId) {
              p.isSelected = true;
              selectedIndicator = p;
              summary.indicator = selectedIndicator;
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

          const ccgHtml = Template.it('ccgContent', {
            tab1Active,
            tab2Active,
            isAllIndicators: +state.indicatorId === 0,
            summary,
            chart1Active,
            chart2Active,
            chart3Active,
            chart4Active,
            chart5Active,
            chart6Active,
            chart7Active,
            chart8Active,
          });

          document.getElementById('page').innerHTML = filterBarHtml + ccgHtml;

          $('.tooltip').tooltip('hide');
          $('[data-toggle="tooltip"]').tooltip();

          // wire up the bootstrap-select thing
          $('.selectpicker').selectpicker();

          // cause navigation on the select drop down changing
          document.getElementById('indicatorList').addEventListener('change', (event) => {
            if (event.target.value !== state.indicatorId) {
              global.Router.navigate(`/ccg/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.ccgTabId}/indicator/${event.target.value}/chart/${state.ccgChartId}`);
            }
          });
          document.getElementById('dateList').addEventListener('change', (event) => {
            if (event.target.value !== state.dateId) {
              global.Router.navigate(`/ccg/date/${event.target.value}/comparedWith/${state.comparisonDateId}/tab/${state.ccgTabId}/indicator/${state.indicatorId}/chart/${state.ccgChartId}`);
            }
          });
          document.getElementById('dateCompareList').addEventListener('change', (event) => {
            if (event.target.value !== state.comparisonDateId) {
              global.Router.navigate(`/ccg/date/${state.dateId}/comparedWith/${event.target.value}/tab/${state.ccgTabId}/indicator/${state.indicatorId}/chart/${state.ccgChartId}`);
            }
          });
          const chart = document.getElementById('id_chart');
          if (chart) {
            chart.addEventListener('change', (event) => {
              if (event.target.value !== state.ccgChartId) {
                global.Router.navigate(`/ccg/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.ccgTabId}/indicator/${state.indicatorId}/chart/${event.target.value}`);
              }
            });
          }

          const addStartEndDateListeners = () => {
            const endDateElement = document.getElementById('endDate');
            if (endDateElement) {
              endDateElement.addEventListener('change', (event) => {
                if (event.target.value !== state.practiceChartEndDate) {
                  state.practiceChartEndDate = event.target.value;
                  displayCCGChart(
                    state.ccgChartId,
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
                  displayCCGChart(
                    state.ccgChartId,
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
          if (+state.ccgChartId) {
            setTimeout(() => {
              displayCCGChart(state.ccgChartId, summary);
              addStartEndDateListeners();
            }, 0);
          }

          $('li a[role="tab"]').on('shown.bs.tab', (e) => {
            state.ccgTabId = $(e.currentTarget).data('id');
            global.Router.shift(`/ccg/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.ccgTabId}/indicator/${state.indicatorId}/chart/${state.ccgChartId}`, true);
          });
        }

        if (callback) callback();
      });
  });
};
