import Template from 'rw-templater';
import api from '../api';

const modal = {

  initialize: (patientLookup) => {
    modal.patientLookup = patientLookup;

    document.getElementById('patientTable').addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() !== 'button') return;

      const { type, patientId } = e.target.dataset;

      if (type === 'delete') {
        $('#modal')
          .html(Template.it('modal-note-sure', { nhs: modal.patientLookup[patientId].nhs, id: modal.patientLookup[patientId].id }))
          .modal();
      } else {
        $('#modal')
          .html(Template.it('modal-note', { patient: modal.patientLookup[patientId] }))
          .modal();
      }
    });

    const modalClick = (e) => {
      if (e.target.classList.contains('close-me')) {
        $('#modal').modal('hide');
      } else if (e.target.tagName.toLowerCase() === 'button') {
        if (e.target.classList.contains('btn-danger')) { // delete note
          api.notesDelete(e.target.dataset.patientId).then(() => {
            const currentPatient = modal.patientLookup[e.target.dataset.patientId];
            // update ui;
            currentPatient.indicatorNotesToDisplay = [];
            currentPatient.isNote = false;
            currentPatient.patientNote = '';
            currentPatient.indicatorNotes = [];

            $(`td.note-field[data-patient-id=${e.target.dataset.patientId}]`).html(Template.it('note', currentPatient));

            $('#modal').modal('hide');
          });
        } else { // upsert note
          const timeNow = new Date();

          // create note
          const note = {
            id: e.target.dataset.patientId,
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
          api.notesUpsert(note).then(() => {
            const currentPatient = modal.patientLookup[e.target.dataset.patientId];
            currentPatient.indicatorNotes = note.indicatorNotes;
            currentPatient.indicatorNotesToDisplay = note
              .indicatorNotes.filter(nt => currentPatient
                .indicators.filter(indicator => indicator.id === nt.id).length > 0);
            currentPatient.isNote = true;
            currentPatient.indicators.forEach((indicator) => {
              indicator.note = '';
              currentPatient.indicatorNotes.forEach((nt) => {
                if (nt.id === indicator.id) {
                  indicator.note = nt.note;
                }
              });
            });
            currentPatient.patientNote = note.patientNote;
            currentPatient.patientNoteUpdatedBy = note.patientNoteUpdatedBy;
            currentPatient.patientNoteUpdatedLocaleString = note.patientNoteUpdatedLocaleString;

            currentPatient.isNote = !!currentPatient.patientNote
              || currentPatient.indicatorNotesToDisplay.length > 0;

            $(`td.note-field[data-patient-id=${e.target.dataset.patientId}]`).html(
              Template.it('note', currentPatient)
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
