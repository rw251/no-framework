import Template from 'rw-templater';
import state from '../state';
import api from '../api';
import { updateActive, updateBreadcrumbs } from './common';

export default (callback, practiceId, dateId) => {
  // always start a progress bar if there is any async
  // behaviour loading the content.
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;

  Promise
    .all([
      api.practices(),
      api.datesForDisplay(),
      api.multiple(practiceId, dateId),
    ])
    .then(([practices, dates, { patients }]) => {
      // check if the most recently requested page is this
      // otherwise do nothing.
      if (state.latestPageRequestId === localPageRequestId) {
        // ready to display content so make the progress bar complete
        window.Progress.done();

        // for testing no patients
        // patients = [];

        const isPatients = patients.length > 0;

        state.practiceId = practiceId;
        state.dateId = dateId;

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

        patients.forEach((p) => {
          p.isNote = !!p.patientNote || p.indicators.filter(i => p.indicatorNotes
            .filter(ii => i.id === ii.id).length > 0).length > 0;
        });

        updateActive('tab-practice');
        const crumbs = [
          { label: state.practiceName, path: `/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/tab/${state.practiceTabId}` },
          { label: 'Patients affected by more than one indicator' },
        ];
        updateBreadcrumbs(crumbs);

        const filterBarHtml = Template.it('filterBarMultiple', {
          selectedDate,
          dates,
        });

        const practiceHtml = selectedPractice
          ? Template.it('multiplePatientContent', {
            isPatients,
            patients,
          })
          : '';

        document.getElementById('page').innerHTML = filterBarHtml + practiceHtml;

        $('.tooltip').tooltip('hide');
        $('[data-toggle="tooltip"]').tooltip();

        // cause navigation on the select drop down changing
        document.getElementById('dateList').addEventListener('change', (event) => {
          if (event.target.value !== state.dateId) {
            global.Router.navigate(`/practice/${state.practiceId}/date/${event.target.value}/multiple`);
          }
        });
      }

      if (callback) callback();
    });
};
