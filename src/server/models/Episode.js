const mongoose = require('mongoose');

const EpisodeSchema = new mongoose.Schema({
  s: { type: Date, required: true }, // episode start date
  i: { type: Number, required: true }, // indicator id
  p: { type: Number, required: true }, // patient id
  e: Date, // episode end date - absence indicates ongoing episode
}, { collection: 'episodes' });

module.exports = mongoose.model('Episode', EpisodeSchema);
