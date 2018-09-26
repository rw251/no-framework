import Template from 'rw-templater';
import state from '../state';
import api from '../api';
import { updateActive, updateBreadcrumbs } from './common';
import { displayPracticeIndicatorChart } from '../charts';
import modal from './modalController';

export default (
  callback, practiceId, dateId, comparisonDateId,
  indicatorId, reportType, chartOrTable, tabId
) => {
  // always start a progress bar if there is any async
  // behaviour loading the content.
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  state.reportType = reportType || 'affected';
  const localPageRequestId = state.latestPageRequestId;

  Promise
    .all([
      api.practices(),
      api[state.reportType](practiceId, indicatorId, dateId, comparisonDateId),
      api.indicators(),
      api.datesForDisplay(),
    ])
    .then(([practices, summary, indicators, dates]) => {
      // check if the most recently requested page is this
      // otherwise do nothing.
      if (state.latestPageRequestId === localPageRequestId) {
        // ready to display content so make the progress bar complete
        window.Progress.done();

        // spoof no patients
        // patients = [];

        const comparisonDates = JSON.parse(JSON.stringify(dates.slice(1)));

        state.practiceId = practiceId;
        state.dateId = dateId;
        state.indicatorId = indicatorId;
        state.comparisonDateId = comparisonDateId;
        state.practiceIndicatorTabId = tabId || state.practiceIndicatorTabId;
        state.practiceIndicatorChartOrTable = chartOrTable || 'table';

        global.Router.shift(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/indicator/${state.indicatorId}/${state.reportType}/show/${state.practiceIndicatorChartOrTable}/tab/${state.practiceIndicatorTabId}`);

        const tab1Active = +state.practiceIndicatorTabId === 1;
        const tab2Active = +state.practiceIndicatorTabId === 2;
        const tab3Active = +state.practiceIndicatorTabId === 3;

        const noPatients = summary.patients.length === 0;
        const somePatients = !noPatients;

        const showTable = state.practiceIndicatorChartOrTable === 'table';
        const showChart = !showTable;

        let selectedIndicator;
        indicators.forEach((i) => {
          if (i._id === +state.indicatorId) {
            i.isSelected = true;
            selectedIndicator = i;
          } else {
            delete i.isSelected;
          }
        });

        const patientLookup = {};
        summary.patients.forEach((p) => {
          if (!p.indicatorNotes) p.indicatorNotes = [];
          p.indicatorNotesToDisplay = p.indicatorNotes.filter(note => p.indicators.filter(indicator => indicator.id === note.id).length > 0);
          p.isNote = !!p.patientNote || p.indicatorNotesToDisplay.length > 0;
          p.indicators.forEach((indicator) => {
            indicator.note = '';
            p.indicatorNotes.forEach((note) => {
              if (note.id === indicator.id) {
                indicator.note = note.note;
              }
            });
          });
          p.patientNote = p.patientNote || '';
          patientLookup[p.id] = p;
        });

        practices.forEach((p) => {
          if (p._id === +state.practiceId) {
            state.practiceName = p.short_name;
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
        const crumbs = [
          { label: state.practiceName, path: `/practice/${practiceId}/date/${dateId}/comparedWith/${comparisonDateId}/tab/${state.practiceTabId}` },
          { label: selectedIndicator.short_name },
        ];
        updateBreadcrumbs(crumbs);

        const filterBarHtml = Template.it('filterBarPracticeIndicator', {
          indicators,
          selectedDate,
          selectedComparisonDate,
          dates,
          comparisonDates,
          isAffected: state.reportType === 'affected',
          isExisting: state.reportType === 'existing',
          isResolved: state.reportType === 'resolved',
          isNew: state.reportType === 'new',
        });

        const practiceIndicatorHtml = Template.it('practiceIndicatorContent', {
          tab1Active,
          tab2Active,
          tab3Active,
          tabId: state.practiceIndicatorTabId,
          noPatients,
          somePatients,
          reportType,
          summary,
          showTable,
          showChart,
          info: selectedIndicator.info,
        });

        document.getElementById('page').innerHTML = filterBarHtml + practiceIndicatorHtml;

        $('.tooltip').tooltip('hide');
        $('[data-toggle="tooltip"]').tooltip();

        // wire up the bootstrap-select thing
        $('.selectpicker').selectpicker();

        // cause navigation on the select drop down changing
        document.getElementById('indicatorList').addEventListener('change', (event) => {
          if (event.target.value !== state.indicatorId) {
            global.Router.navigate(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/indicator/${event.target.value}/${state.reportType}/show/${state.practiceIndicatorChartOrTable}/tab/${state.practiceIndicatorTabId}`);
          }
        });

        document.getElementById('typeList').addEventListener('change', (event) => {
          if (event.target.value !== state.reportType) {
            global.Router.navigate(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/indicator/${state.indicatorId}/${event.target.value}/show/${state.practiceIndicatorChartOrTable}/tab/${state.practiceIndicatorTabId}`);
          }
        });

        document.getElementById('dateList').addEventListener('change', (event) => {
          if (event.target.value !== state.dateId) {
            global.Router.navigate(`/practice/${state.practiceId}/date/${event.target.value}/comparedWith/${state.comparisonDateId}/indicator/${state.indicatorId}/${state.reportType}/show/${state.practiceIndicatorChartOrTable}/tab/${state.practiceIndicatorTabId}`);
          }
        });

        document.getElementById('dateCompareList').addEventListener('change', (event) => {
          if (event.target.value !== state.comparisonDateId) {
            global.Router.navigate(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${event.target.value}/indicator/${state.indicatorId}/${state.reportType}/show/${state.practiceIndicatorChartOrTable}/tab/${state.practiceIndicatorTabId}`);
          }
        });

        state.tables.patientTable = $('#patientTable').DataTable({
          info: false, // we don't want showing 1 to n of n
          searching: false, // we don't want a search box
          stateSave: true, // let's remember which page/sorting etc
          paging: false, // always want all indicators
          scrollY: '50vh',
          scrollCollapse: true,
        });

        state.tables.trendTable = $('#trendTable').DataTable({
          info: false, // we don't want showing 1 to n of n
          searching: false, // we don't want a search box
          stateSave: true, // let's remember which page/sorting etc
          paging: false, // always want all indicators
          scrollY: '50vh',
          scrollCollapse: true,
        });

        $('li a[role="tab"]').on('shown.bs.tab', (e) => {
          state.practiceIndicatorTabId = $(e.currentTarget).data('id');
          if (+state.practiceIndicatorTabId === 2) $('#toggleChart').show();
          else $('#toggleChart').hide();
          global.Router.shift(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/indicator/${state.indicatorId}/${state.reportType}/show/${state.practiceIndicatorChartOrTable}/tab/${state.practiceIndicatorTabId}`, true);

          if (e.currentTarget.id === 'tableTab') {
            // ensure headers display correctly on hidden tab
            state.tables.patientTable.columns.adjust().draw(false);
          } else if (e.currentTarget.id === 'trendTableTab') {
            // ensure headers display correctly on hidden tab
            state.tables.trendTable.columns.adjust().draw(false);
          }
        });

        const addStartEndDateListeners = () => {
          document.getElementById('endDate').addEventListener('change', (event) => {
            if (event.target.value !== state.practiceIndicatorEndDate) {
              state.practiceIndicatorEndDate = event.target.value;
              displayPracticeIndicatorChart(summary.chartData, state.practiceIndicatorStartDate, state.practiceIndicatorEndDate);
              addStartEndDateListeners();
            }
          });

          document.getElementById('startDate').addEventListener('change', (event) => {
            if (event.target.value !== state.practiceIndicatorStartDate) {
              state.practiceIndicatorStartDate = event.target.value;
              displayPracticeIndicatorChart(summary.chartData, state.practiceIndicatorStartDate, state.practiceIndicatorEndDate);
              addStartEndDateListeners();
            }
          });
        };

        modal.initialize(patientLookup);

        // add chart
        if (state.practiceIndicatorChartOrTable === 'chart') {
          setTimeout(() => {
            displayPracticeIndicatorChart(summary.chartData, state.practiceIndicatorStartDate, state.practiceIndicatorEndDate);
            addStartEndDateListeners();
          }, 0);
        }

        if (callback) callback();
      }
    });
};
