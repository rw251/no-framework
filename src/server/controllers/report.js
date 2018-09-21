const Report = require('../models/Report');

// lean true returns json objects i.e. smaller but can't then save/update them
exports.getForPracticeOnDate = (practiceId, dateId) => Report
  .findOne({ practiceId, dateId }).lean().exec();

exports.getForPracticeOnDates = (practiceId, dateIds) => Report
  .find({ practiceId, dateId: { $in: dateIds } }).lean().exec();

exports.getForPractice = practiceId => Report.find({ practiceId }).lean().exec();

exports.getCcgTotals = dateId => Report.aggregate([
  { $match: { dateId } },
  { $unwind: '$i' },
  { $group: { _id: '$i.id', n: { $sum: '$i.n' }, d: { $sum: '$i.d' } } },
]).exec();

exports.getCcgAverages = dateId => Report.aggregate([
  { $match: { dateId } },
  { $unwind: '$i' },
  { $group: { _id: '$i.id', n: { $sum: '$i.n' }, d: { $sum: '$i.d' } } },
]).exec();

exports.getForAllIndicators = dateIds => Report.find({ dateId: { $in: dateIds } })
  .select('-i -multiplePatients')
  .sort('dateId')
  .lean()
  .exec();

exports.getTrendDataForIndicator = (indicatorId, dateIds) => Report
  .find({ dateId: { $in: dateIds } })
  .select({
    i: { $elemMatch: { id: indicatorId } },
    _id: 0,
    practiceId: 1,
    dateId: 1,
    'i.id': 1,
    'i.n': 1,
    'i.d': 1,
  }).lean().exec();

exports.getSingleIndicatorData = dateId => Report.find({ dateId }).lean().exec();

exports.getAllIndicatorData = dateId => Report.aggregate([
  { $match: { dateId } },
  { $project: { i: 1, practiceId: 1, _id: 0 } },
  { $unwind: '$i' },
  { $match: { 'i.id': { $in: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] } } },
  { $group: { _id: '$practiceId', affected: { $sum: '$i.n' }, patients: { $push: '$i.p' }, eligible: { $sum: '$i.d' } } },
  {
    $project: {
      _id: 1,
      affected: 1,
      eligible: 1,
      affectedUnique: {
        $reduce: {
          input: '$patients',
          initialValue: [],
          in: { $setUnion: ['$$value', '$$this'] },
        },
      },
      multiple: {
        $reduce: {
          input: '$patients',
          initialValue: [],
          in: { $concatArrays: ['$$value', '$$this'] },
        },
      },
    },
  },
  {
    $project: {
      _id: 1,
      affected: 1,
      eligible: 1,
      affectedUnique: { $size: '$affectedUnique' },
      multiple: {
        $reduce: {
          input: '$multiple',
          initialValue: { sofar: [], dupes: [], dupeCount: 0 },
          in: {
            sofar: { $concatArrays: ['$$value.sofar', ['$$this']] },
            dupes: { $concatArrays: ['$$value.dupes', { $cond: { if: { $in: ['$$this', '$$value.sofar'] }, then: ['$$this'], else: [] } }] },
            dupeCount: { $add: ['$$value.dupeCount', { $cond: { if: { $and: [{ $in: ['$$this', '$$value.sofar'] }, { $not: { $in: ['$$this', '$$value.dupes'] } }] }, then: 1, else: 0 } }] },
          },
        },
      },
    },
  },
  { $project: { _id: 0, practiceId: '$_id', affected: 1, eligible: 1, affectedUnique: 1, multiple: '$multiple.dupeCount' } },
]).exec();
