const Patient = require('../models/Patient');

// lean true returns json objects i.e. smaller but can't then save/update them
exports.getForPatientIds = patientIds => Patient.find({ _id: { $in: patientIds } }).lean().exec();
