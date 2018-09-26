const Patient = require('../models/Patient');

// lean true returns json objects i.e. smaller but can't then save/update them
exports.getForPatientIds = patientIds => Patient.find({ _id: { $in: patientIds } }).lean().exec();

exports.setNote = (
  id,
  patientNote,
  indicatorNotes,
  patientNoteUpdated,
  patientNoteUpdatedBy
) => Patient.update(
  { _id: id }, {
    $set: {
      patientNote,
      indicatorNotes,
      patientNoteUpdated,
      patientNoteUpdatedBy,
    },
  }
).exec();

exports.deleteNote = patientId => Patient.update({ _id: patientId }, {
  $set: {
    patientNote: '',
    indicatorNotes: [],
    patientNoteUpdated: new Date(),
    patientNoteUpdatedBy: '',
  },
}).exec();
