const Episode = require('../models/Episode');

// lean true returns json objects i.e. smaller but can't then save/update them
exports.getForPatientIds = patientIds => Episode.find({ p: { $in: patientIds } }).sort('s').lean().exec();
