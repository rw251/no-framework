const mongoose = require('mongoose');

const PracticeSchema = new mongoose.Schema({
  _id: Number,
  code: String,
  short_name: String,
  long_name: String,
  ip_address_ranges: [{
    start: { type: String },
    end: { type: String },
  }],
  first_report_date: Date,
  indicators: [Number],
});

const Practice = mongoose.model('Practice', PracticeSchema);
module.exports = Practice;
