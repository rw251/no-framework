const Indicator = require('../models/Indicator');

// lean true returns json objects i.e. smaller but can't then save/update them
exports.list = () => Indicator.find().lean().exec();

exports.getById = indicatorId => Indicator.findById(indicatorId).lean().exec();
