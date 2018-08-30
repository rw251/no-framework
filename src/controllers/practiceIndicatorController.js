import Template from 'rw-templater';
import state from '../state';
import api from '../api';
import { updateActive, updateBreadcrumbs } from './common';

export default (callback, practiceId, dateId, comparisonDateId, indicatorId, reportType, tabId) => {
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
    .then(([practices, { patients, tableData }, indicators, dates]) => {
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
        state.practiceIndicatorTabId = tabId || 1;

        const tab1Active = +state.practiceIndicatorTabId === 1;
        const tab2Active = +state.practiceIndicatorTabId === 2;
        const tab3Active = +state.practiceIndicatorTabId === 3;

        const noPatients = patients.length === 0;
        const somePatients = !noPatients;

        let selectedIndicator;
        indicators.forEach((i) => {
          if (i._id === +state.indicatorId) {
            i.isSelected = true;
            selectedIndicator = i;
          } else {
            delete i.isSelected;
          }
        });

        patients.forEach((p) => {
          p.isNote = !!p.patientNote || p.indicators.filter(i => p.indicatorNotes
            .filter(ii => i.id === ii.id).length > 0).length > 0;
          p.noNote = !p.isNote;
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
          noPatients,
          somePatients,
          patients,
          tableData,
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
            global.Router.navigate(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/indicator/${event.target.value}/${state.reportType}/tab/${state.practiceIndicatorTabId}`);
          }
        });

        document.getElementById('typeList').addEventListener('change', (event) => {
          if (event.target.value !== state.reportType) {
            global.Router.navigate(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/indicator/${state.indicatorId}/${event.target.value}/tab/${state.practiceIndicatorTabId}`);
          }
        });

        document.getElementById('dateList').addEventListener('change', (event) => {
          if (event.target.value !== state.dateId) {
            global.Router.navigate(`/practice/${state.practiceId}/date/${event.target.value}/comparedWith/${state.comparisonDateId}/indicator/${state.indicatorId}/${state.reportType}/tab/${state.practiceIndicatorTabId}`);
          }
        });

        document.getElementById('dateCompareList').addEventListener('change', (event) => {
          if (event.target.value !== state.comparisonDateId) {
            global.Router.navigate(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${event.target.value}/indicator/${state.indicatorId}/${state.reportType}/tab/${state.practiceIndicatorTabId}`);
          }
        });

        $('li a[role="tab"]').on('shown.bs.tab', (e) => {
          state.practiceIndicatorTabId = $(e.currentTarget).data('id');
          global.Router.shift(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/indicator/${state.indicatorId}/${state.reportType}/tab/${state.practiceIndicatorTabId}`, true);
        });

        if (callback) callback();
      }
    });
};
