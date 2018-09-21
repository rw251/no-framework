const mongoose = require('mongoose');

const DateSchema = new mongoose.Schema({
  _id: Number,
  date: Date,
}, { collection: 'dates' });

module.exports = mongoose.model('Date', DateSchema);
