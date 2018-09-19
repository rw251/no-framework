import Template from 'rw-templater';
import state from '../state';
import api from '../api';
import { updateActive, updateBreadcrumbs } from './common';
import { displayPracticeIndicatorChart } from '../charts';

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

        $('li a[role="tab"]').on('shown.bs.tab', (e) => {
          state.practiceIndicatorTabId = $(e.currentTarget).data('id');
          if (+state.practiceIndicatorTabId === 2) $('#toggleChart').show();
          else $('#toggleChart').hide();
          global.Router.shift(`/practice/${state.practiceId}/date/${state.dateId}/comparedWith/${state.comparisonDateId}/indicator/${state.indicatorId}/${state.reportType}/show/${state.practiceIndicatorChartOrTable}/tab/${state.practiceIndicatorTabId}`, true);
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

        document.getElementById('patientTable').addEventListener('click', (e) => {
          if (e.target.tagName.toLowerCase() !== 'button') return;

          const { type, patientId } = e.target.dataset;

          if (type === 'delete') {
            $('#modal')
              .html(Template.it('modal-note-sure', { nhs: patientLookup[patientId].nhs, id: patientLookup[patientId].id }))
              .modal();
          } else {
            $('#modal')
              .html(Template.it('modal-note', { patient: patientLookup[patientId] }))
              .modal();
          }
        });

        const modalClick = (e) => {
          if (e.target.classList.contains('close-me')) {
            $('#modal').modal('hide');
          } else if (e.target.tagName.toLowerCase() === 'button') {
            if (e.target.classList.contains('btn-danger')) { // delete note
              api.notesDelete(e.target.dataset.patientId).then(() => {
                // update ui;
                patientLookup[e.target.dataset.patientId].indicatorNotesToDisplay = [];
                patientLookup[e.target.dataset.patientId].isNote = false;
                patientLookup[e.target.dataset.patientId].patientNote = '';
                patientLookup[e.target.dataset.patientId].indicatorNotes = [];

                $(`td.note-field[data-patient-id=${e.target.dataset.patientId}]`).html(Template.it('note', patientLookup[e.target.dataset.patientId]));

                $('#modal').modal('hide');
              });
            } else { // upsert note
              const timeNow = new Date();

              // create note
              const note = {
                patientNote: $('#patientNote').val(),
                patientNoteUpdated: timeNow.toISOString(),
                patientNoteUpdatedBy: $('#usersName').text(),
                patientNoteUpdatedLocaleString: timeNow.toLocaleString('en-GB'),
                indicatorNotes: [],
              };

              const indicatorTextareas = document.querySelectorAll('textarea.indicator-note');
              for (let i = 0; i < indicatorTextareas.length; i += 1) {
                if (indicatorTextareas[i].value && indicatorTextareas[i].value.replace(/ /g, '').length > 0) {
                  note.indicatorNotes.push({
                    id: +indicatorTextareas[i].dataset.indicatorId,
                    name: indicatorTextareas[i].dataset.indicatorName,
                    note: indicatorTextareas[i].value,
                  });
                }
              }

              // upsert note
              api.notesUpsert(e.target.dataset.patientId, note).then(() => {
                patientLookup[e.target.dataset.patientId].indicatorNotes = note.indicatorNotes;
                patientLookup[e.target.dataset.patientId].indicatorNotesToDisplay = note.indicatorNotes.filter(nt => patientLookup[e.target.dataset.patientId].indicators.filter(indicator => indicator.id === nt.id).length > 0);
                patientLookup[e.target.dataset.patientId].isNote = true;
                patientLookup[e.target.dataset.patientId].indicators.forEach((indicator) => {
                  indicator.note = '';
                  patientLookup[e.target.dataset.patientId].indicatorNotes.forEach((nt) => {
                    if (nt.id === indicator.id) {
                      indicator.note = nt.note;
                    }
                  });
                });
                patientLookup[e.target.dataset.patientId].patientNote = note.patientNote;
                patientLookup[e.target.dataset.patientId].patientNoteUpdatedBy = note.patientNoteUpdatedBy;
                patientLookup[e.target.dataset.patientId].patientNoteUpdatedLocaleString = note.patientNoteUpdatedLocaleString;

                $(`td.note-field[data-patient-id=${e.target.dataset.patientId}]`).html(Template.it('note', patientLookup[e.target.dataset.patientId]));

                $('#modal').modal('hide');
              });
            }
          }
        };

        const modalElement = document.getElementById('modal');
        if (!modalElement.classList.contains('click-handler-added')) {
          modalElement.addEventListener('click', modalClick);
          modalElement.classList.add('click-handler-added');
        }

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
