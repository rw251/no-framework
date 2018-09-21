import Template from 'rw-templater';
import state from '../state';
import api from '../api';
import { updateActive, updateBreadcrumbs } from './common';

const modal = {

  initialize: (patientLookup) => {
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

            $(`td.note-field[data-patient-id=${e.target.dataset.patientId}]`).html(
              Template.it('note', patientLookup[e.target.dataset.patientId])
            );

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
  },

};
export default modal;
