const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  practiceId: { type: Number, required: true },
  dateId: { type: Number, required: true },
  practiceSize: { type: Number, required: true },
  affected: { type: Number, required: true }, // number of patients affected
  affectedUnique: { type: Number, required: true },
  // number of patients affected without counting a patient more than once
  eligible: { type: Number, required: true }, // number of eligible patients
  eligibleUnique: { type: Number, required: true },
  // number of eligible patients without counting a patient more than once
  multiple: { type: Number, required: true }, // number of patients breaching multiple indicators
  multiplePatients: [Number],
  i: [
    {
      id: { type: Number, required: true }, // indicator id
      n: { type: Number, required: true }, // number of affected patients (numerator)
      d: { type: Number, required: true }, // number of eligible patients (denominator)
      p: [Number], // patient id
      _id: false,
    },
  ],
}, { collection: 'reports' });

module.exports = mongoose.model('Report', ReportSchema);
