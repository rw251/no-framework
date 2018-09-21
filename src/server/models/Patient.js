const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  _id: Number,
  nhs: Number,
  patientNote: String, // the note,
  patientNoteUpdated: Date, // last updated date
  patientNoteUpdatedBy: String, // last updated by
  indicatorNotes: [
    {
      id: Number, // the indicator id
      name: String, // the indicator name
      note: String, // the note
    },
  ],
}, { collection: 'patient' });

module.exports = mongoose.model('Patient', PatientSchema);
