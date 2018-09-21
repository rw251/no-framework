const mongoose = require('mongoose');

const IndicatorSchema = new mongoose.Schema({
  _id: Number,
  code: String,
  short_name: String,
  long_name: String,
  severity: String,
  info: String,
}, { collection: 'indicators' });

module.exports = mongoose.model('Indicator', IndicatorSchema);
