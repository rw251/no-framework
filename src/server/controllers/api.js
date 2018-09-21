const json2csv = require('json2csv');
const dateCtrl = require('./date');
const episodeCtrl = require('./episode');
const indicatorCtrl = require('./indicator');
const patientCtrl = require('./patient');
const practiceCtrl = require('./practice');
const reportCtrl = require('./report');
const common = require('./common');

const getAffectedUnique = (report, practice) => {
  const patients = {};
  const patientsMultiple = {};
  if (report && report.i && report.i.length > 0) {
    report.i.forEach((v) => {
      if (!common.isIndicatorUsed(v.id, practice)) return;
      if (v.p) {
        v.p.forEach((vv) => {
          if (!patients[vv]) patients[vv] = 1;
          else patientsMultiple[vv] = 1;
        });
      }
    });
  }
  return Object.keys(patients).length;
};

const getAffectedMultiple = (report, practice) => {
  const patients = {};
  const patientsMultiple = {};
  if (report && report.i && report.i.length > 0) {
    report.i.forEach((v) => {
      if (!common.isIndicatorUsed(v.id, practice)) return;
      if (v.p) {
        v.p.forEach((vv) => {
          if (!patients[vv]) patients[vv] = 1;
          else patientsMultiple[vv] = 1;
        });
      }
    });
  }
  return Object.keys(patientsMultiple).length;
};

const getPracticeData = async (req, res, next) => {
  const practiceId = +req.params.practiceId;
  const dateId = +req.params.dateId;
  const comparisonDateId = +req.params.comparisonDateId;
  const rtn = { practiceId, dateId, comparisonDateId };

  try {
    rtn.report = await reportCtrl.getForPracticeOnDate(practiceId, dateId);
    rtn.comparisonReport = await reportCtrl.getForPracticeOnDate(practiceId, comparisonDateId);
    rtn.practice = await practiceCtrl.getById(practiceId);

    const firstReportDate = rtn.practice.first_report_date || new Date(2000, 1, 1);

    rtn.dateLookup = await dateCtrl.list();
    rtn.datesForChart = rtn.dateLookup
      .filter((v, i) => new Date(v.date) >= firstReportDate
      && (i === 0 || new Date(v.date).getDate() === 1));
    rtn.allReports = await reportCtrl.getForPracticeOnDates(
      practiceId,
      rtn.datesForChart.map(x => x._id)
    );
    rtn.ccgTotals = await reportCtrl.getCcgTotals(dateId);
    rtn.indicatorLookup = await indicatorCtrl.list();
    rtn.practiceLookup = await practiceCtrl.list();
  } catch (err) {
    return next(err);
  }
  return rtn;
};

const getAllIndicatorData = async (req, res, next) => {
  const dateId = +req.params.dateId;
  const rtn = { };

  try {
    rtn.reports = await reportCtrl.getAllIndicatorData(dateId);

    rtn.dateLookup = await dateCtrl.list();
    rtn.datesForChart = rtn.dateLookup
      .filter((v, i) => i === 0 || new Date(v.date).getDate() === 1);

    rtn.allReports = await reportCtrl.getForAllIndicators(rtn.datesForChart.map(x => x._id));
    rtn.ccgTotals = await reportCtrl.getCcgTotals(dateId);
    rtn.practiceLookup = await practiceCtrl.list();
  } catch (err) {
    return next(err);
  }
  return rtn;
};

const getSingleIndicatorData = async (req, res, next) => {
  const dateId = +req.params.dateId;
  const comparisonDateId = +req.params.comparisonDateId;
  const indicatorId = +req.params.indicatorId;
  const rtn = { indicatorId };

  try {
    rtn.reports = await reportCtrl.getSingleIndicatorData(dateId);
    rtn.comparisonReports = await reportCtrl.getSingleIndicatorData(comparisonDateId);
    rtn.indicatorLookup = await indicatorCtrl.list();
    rtn.practiceLookup = await practiceCtrl.list();
    rtn.dateLookup = await dateCtrl.list();
    rtn.ccgAverages = await reportCtrl.getCcgAverages(dateId);
    rtn.datesForChart = rtn.dateLookup
      .filter((v, i) => i === 0 || new Date(v.date).getDate() === 1);
    rtn.trends = await reportCtrl.getTrendDataForIndicator(
      indicatorId,
      rtn.datesForChart.map(x => x._id)
    );
  } catch (err) {
    return next(err);
  }
  return rtn;
};

const getPatientIds = (indicatorId, report, comparisonReport, type) => {
  let patientIds = [];
  const indicator = common.getObjectById(indicatorId, report.i);
  const comparisonIndicator = common.getObjectById(indicatorId, comparisonReport.i);
  const patients = indicator !== null ? indicator.p : [];
  const comparisonPatients = comparisonIndicator !== null ? comparisonIndicator.p : [];

  if (type === 'resolved') {
    patientIds = common.getResolvedCases(patients, comparisonPatients);
  } else if (type === 'existing') {
    patientIds = common.getExistingCases(patients, comparisonPatients);
  } else if (type === 'new') {
    patientIds = common.getNewCases(patients, comparisonPatients);
  } else if (type === 'numerator') {
    patientIds = patients;
  }

  return patientIds;
};

const getPatientData = async (req, res, next) => {
  const practiceId = +req.params.practiceId;
  const dateId = +req.params.dateId;
  const comparisonDateId = +req.params.comparisonDateId;
  const indicatorId = +req.params.indicatorId;
  const reportType = req.params.reportType || 'numerator';
  const rtn = { practiceId, dateId, comparisonDateId, indicatorId, reportType };

  try {
    rtn.practice = await practiceCtrl.getById(practiceId);
    const firstReportDate = rtn.practice.first_report_date || new Date(2000, 1, 1);
    rtn.report = await reportCtrl.getForPracticeOnDate(practiceId, dateId);
    const comparisonReport = await reportCtrl.getForPracticeOnDate(practiceId, comparisonDateId);
    rtn.patientIds = getPatientIds(indicatorId, rtn.report, comparisonReport, reportType);
    rtn.episodes = await episodeCtrl.getForPatientIds(rtn.patientIds);
    rtn.indicatorLookup = await indicatorCtrl.list();
    rtn.dateLookup = await dateCtrl.list();
    rtn.patientLookup = await patientCtrl.getForPatientIds(rtn.patientIds);
    rtn.trendDates = rtn.dateLookup.filter(v => new Date(v.date) >= firstReportDate);
    rtn.trendReports = await reportCtrl.getForPracticeOnDates(practiceId, rtn.trendDates);
    rtn.indicator = await indicatorCtrl.getById(indicatorId);
  } catch (err) {
    return next(err);
  }
  return rtn;
};

const getMultiplePatientData = async (req, res, next) => {
  const practiceId = +req.params.practiceId;
  const dateId = +req.params.dateId;
  const rtn = { practiceId, dateId };

  try {
    rtn.practice = await practiceCtrl.getById(practiceId);
    rtn.report = await reportCtrl.getForPracticeOnDate(practiceId, dateId);
    rtn.patientIds = rtn.report.multiplePatients;
    rtn.episodes = await episodeCtrl.getForPatientIds(rtn.patientIds);
    rtn.indicatorLookup = await indicatorCtrl.list();
    rtn.dateLookup = await dateCtrl.list();
    rtn.patientLookup = await patientCtrl.getForPatientIds(rtn.patientIds);
  } catch (err) {
    return next(err);
  }
  return rtn;
};

const getSummaryData = (report, practice) => {
  const summaryData = {};

  summaryData.practiceSize = report.practiceSize;
  summaryData.totalPatients = getAffectedUnique(report, practice);
  summaryData.multiple = getAffectedMultiple(report, practice);
  summaryData.allIndicatorAverage = `${report.eligible === 0 ? 0 : ((report.affected / report.eligible) * 100).toFixed(1)}%`;

  return summaryData;
};

const getMetaData = (practiceId, practiceLookup, dateId, comparisonDateId, dateLookup) => {
  const practice = common.getObjectByUnderscoreId(practiceId, practiceLookup);
  const reportDate = common.getDate(dateId, dateLookup);
  const comparisonDate = common.getDate(comparisonDateId, dateLookup);

  let metadata = 'Patient Safety Dashboard';
  metadata += '\n\n';
  metadata += 'Perspective: Single Practice';
  metadata += '\n';
  metadata += `Practice: ${practice ? practice.long_name : ''}`;
  metadata += '\n';
  metadata += `Report date: ${reportDate ? reportDate.toDateString() : ''}`;
  metadata += '\n';
  metadata += `Comparison date: ${comparisonDate ? comparisonDate.toDateString() : ''}`;
  metadata += '\n\n';

  return metadata;
};

const getTableData = (
  report,
  comparisonReport,
  practice,
  indicatorLookup,
  ccgAverages,
  sortBy,
  sortReverse
) => {
  let ind = {};
  let reportIndicator = {};
  let indicator = {};
  let comparisonIndicators = [];
  let reportPatients = [];
  let comparisonPatients = [];
  let ccgAverage = {};
  let ccgAvg = 0;
  let avg = 0;
  let resolvedPatientCount = 0;
  let existingPatientCount = 0;
  let newPatientCount = 0;
  let i;
  let indicators = [];

  for (i = 0; i < indicatorLookup.length; i += 1) {
    indicator = {};
    avg = 0;
    ccgAverage = {};
    ccgAvg = 0;
    resolvedPatientCount = 0;
    existingPatientCount = 0;
    newPatientCount = 0;

    ind = indicatorLookup[i];

    if (common.isIndicatorUsed(ind._id, practice)) {
      indicator.id = ind._id;
      indicator.short_name = ind.short_name;
      indicator.long_name = ind.long_name;
      indicator.severity = ind.severity;

      // returns null if indicator not in report
      reportIndicator = common.getObjectById(ind._id, report.i);

      // Set default values to use if reportIndicator is null
      // Indicator is absent if eligible count is 0.
      if (!reportIndicator) {
        reportIndicator = { n: 0, d: 0, p: [] };
      }

      indicator.num = reportIndicator.n;
      indicator.denom = reportIndicator.d;
      if (indicator.denom > 0) {
        avg = (indicator.num / indicator.denom) * 100;
      }
      indicator.avg = +avg.toFixed(2);


      ccgAverage = common.getObjectByUnderscoreId(indicator.id, ccgAverages);

      if (ccgAverage && ccgAverage.d > 0) {
        ccgAvg = (ccgAverage.n / ccgAverage.d) * 100;
      }

      indicator.ccg = +ccgAvg.toFixed(2);

      reportPatients = reportIndicator.p;

      comparisonIndicators = common.getObjectById(indicator.id, comparisonReport.i);

      comparisonPatients = [];
      if (comparisonIndicators) {
        comparisonPatients = comparisonIndicators.p;
      }

      resolvedPatientCount = common.getResolvedCases(reportPatients, comparisonPatients).length;
      newPatientCount = common.getNewCases(reportPatients, comparisonPatients).length;
      existingPatientCount = common.getExistingCases(reportPatients, comparisonPatients).length;

      indicator.resolved = resolvedPatientCount;
      indicator.new = newPatientCount;
      indicator.existing = existingPatientCount;
      indicator.trendValue = newPatientCount - resolvedPatientCount;

      indicators.push(indicator);
    }
  }

  if (sortBy) {
    const multiplier = sortReverse ? -1 : 1;
    indicators = indicators.sort((a, b) => {
      if (typeof (a[sortBy]) === 'number') {
        return multiplier * (a[sortBy] - b[sortBy]);
      }
      if (a[sortBy] < b[sortBy]) {
        return -1 * multiplier;
      } if (a[sortBy] > b[sortBy]) {
        return 1 * multiplier;
      }
      return 0;
    });
  }

  return indicators;
};

const getTrendChartData = (allReports, practice, indicatorLookup, dateLookup) => {
  // We assume we get a report for every date
  let i;
  let j;
  let report;
  let indicator;
  let date;
  const rtn = { num: { x: 'x', columns: [['x']] }, avg: { x: 'x', columns: [['x']] } };

  for (i = 0; i < indicatorLookup.length; i += 1) {
    indicator = indicatorLookup[i];
    if (common.isIndicatorUsed(indicator._id, practice)) {
      rtn.num.columns.push([indicator.short_name]);
      rtn.avg.columns.push([indicator.short_name]);
    }
  }

  for (i = 0; i < allReports.length; i += 1) {
    report = allReports[i];
    date = common.getDate(report.dateId, dateLookup);
    if (date === null) throw new Error('Date lookup failed');

    rtn.num.columns[0].push(date);
    rtn.avg.columns[0].push(date);
    let k = 0;
    for (j = 0; j < indicatorLookup.length; j += 1) {
      if (common.isIndicatorUsed(indicatorLookup[j]._id, practice)) {
        indicator = common.getObjectById(indicatorLookup[j]._id, report.i);

        const numToPush = indicator !== null ? indicator.n : 0;
        let avgToPush = 0;
        if (indicator && indicator.d > 0) avgToPush = (indicator.n / indicator.d) * 100;

        rtn.num.columns[k + 1].push(numToPush);
        rtn.avg.columns[k + 1].push(avgToPush);
        k += 1;
      }
    }
  }

  return rtn;
};

const getTableDataForAllIndicators = (reports, practiceLookup, sortBy, sortReverse) => {
  let pra;
  let report;
  let i;
  let practices = [];
  let practice = {};
  let avg;

  let totalAffected = 0;
  let totalEligible = 0;
  for (i = 0; i < reports.length; i += 1) {
    totalAffected += reports[i].affected;
    totalEligible += reports[i].eligible;
  }
  const ccgAvg = totalEligible > 0 ? (100 * totalAffected) / totalEligible : 0;

  // Assume that reports array includes a report for each practice.
  for (i = 0; i < reports.length; i += 1) {
    pra = {};
    avg = 0;

    report = reports[i];
    const { practiceId } = report;
    pra.id = practiceId;
    practice = common.getObjectByUnderscoreId(practiceId, practiceLookup);
    if (practice) { // Must be a practice that we don't show
      pra.short_name = practice.short_name;
      pra.long_name = practice.long_name;
      pra.num = report.affectedUnique;
      pra.patientsMultiple = report.multiple;
      if (report.eligible > 0) {
        avg = (report.affected / report.eligible) * 100;
      }
      pra.avg = +avg.toFixed(2);
      pra.ccg = +ccgAvg.toFixed(2);

      practices.push(pra);
    }
  }

  if (sortBy) {
    const multiplier = sortReverse ? -1 : 1;
    practices = practices.sort((a, b) => {
      if (typeof (a[sortBy]) === 'number') {
        return multiplier * (a[sortBy] - b[sortBy]);
      }
      if (a[sortBy] < b[sortBy]) {
        return -1 * multiplier;
      } if (a[sortBy] > b[sortBy]) {
        return 1 * multiplier;
      }
      return 0;
    });
  }

  return practices;
};

const getTableDataForSingleIndicator = (
  indicatorId, reports, comparisonReports,
  practiceLookup, ccgAverages, sortBy, sortReverse
) => {
  let pra = {};
  let avg;
  let report = {};
  let comparisonReport;
  let reportIndicator = {};
  let comparisonIndicator = {};
  let patients;
  let comparisonPatients;
  let ccgAvg = 0;
  let resolvedPatientCount = 0;
  let existingPatientCount = 0;
  let newPatientCount = 0;
  let i;
  let practice = {};
  let practices = [];

  // Get the CCG average for the indicator
  const ccgAverage = ccgAverages.filter(v => v._id === indicatorId);

  if (ccgAverage && ccgAverage.length > 0) {
    ccgAvg = ccgAverage[0].d > 0 ? (ccgAverage[0].n / ccgAverage[0].d) * 100 : 0;
  }


  const fnOutside = element => element.practiceId === report.practiceId;

  // Assume that reports array includes a report for each practice.
  for (i = 0; i < reports.length; i += 1) {
    pra = {};
    avg = 0;
    resolvedPatientCount = 0;
    existingPatientCount = 0;
    newPatientCount = 0;

    report = reports[i];
    const { practiceId } = report;
    pra.id = practiceId;
    practice = common.getObjectByUnderscoreId(practiceId, practiceLookup);
    if (practice) { // This must be a practice that isn't visible
      pra.short_name = practice.short_name;
      pra.long_name = practice.long_name;

      reportIndicator = common.getObjectById(indicatorId, report.i);

      // Set default values to use if reportIndicator is null
      // Indicator is absent if eligible count is 0.
      if (!reportIndicator) {
        reportIndicator = { n: 0, d: 0, p: [] };
      }

      pra.num = reportIndicator.n;
      pra.denom = reportIndicator.d;
      if (pra.denom > 0) {
        avg = (pra.num / pra.denom) * 100;
      }
      pra.avg = +avg.toFixed(2);
      pra.ccg = +ccgAvg.toFixed(2);

      [comparisonReport] = comparisonReports.filter(fnOutside);


      if (comparisonReport) {
        // comparisonReport will always be found as
        // comparisonReports includes a report for each practice
        comparisonIndicator = common.getObjectById(indicatorId, comparisonReport.i);

        patients = reportIndicator.p;
        comparisonPatients = comparisonIndicator !== null ? comparisonIndicator.p : [];

        resolvedPatientCount = common.getResolvedCases(patients, comparisonPatients).length;
        newPatientCount = common.getNewCases(patients, comparisonPatients).length;
        existingPatientCount = common.getExistingCases(patients, comparisonPatients).length;
      }

      pra.resolved = resolvedPatientCount;
      pra.new = newPatientCount;
      pra.existing = existingPatientCount;
      pra.trendValue = newPatientCount - resolvedPatientCount;

      pra.patientsMultiple = report.multiple;

      practices.push(pra);
    }
  }

  if (sortBy) {
    const multiplier = sortReverse ? -1 : 1;
    practices = practices.sort((a, b) => {
      if (typeof (a[sortBy]) === 'number') {
        return multiplier * (a[sortBy] - b[sortBy]);
      }
      if (a[sortBy] < b[sortBy]) {
        return -1 * multiplier;
      } if (a[sortBy] > b[sortBy]) {
        return 1 * multiplier;
      }
      return 0;
    });
  }

  return practices;
};

const getTrendChartDataForSingleIndicator = (trends, practiceLookup, dateLookup) => {
  // trends is an array of length 1600 of
  // { dateId: 1, practiceId: 4, i: [ { id:1 , n:1 , d:5 , p[146336] } ] }
  // i array will either contain one entry or be empty
  // i will be an empty array when eligible count for the indicator is 0.

  let i;
  let j;
  let practice;
  let practicesMap = {};
  let numRow;
  let avgRow;
  let date;
  let ccgNum;
  let ccgDenom;

  const rtn = { num: { x: 'x', columns: [['x']] }, avg: { x: 'x', columns: [['x'], ['CCG Avg']] } };

  const practiceObject = {};
  const trendObject = {};
  trends.forEach((v) => {
    if (v.i) {
      practiceObject[v.practiceId] = '';
      if (!trendObject[v.dateId]) {
        trendObject[v.dateId] = {};
      }
      if (!trendObject[v.dateId][v.practiceId]) {
        trendObject[v.dateId][v.practiceId] = v;
      }
    }
  });

  const practices = Object.keys(practiceObject).map(Number).sort((a, b) => a - b);
  const dates = Object.keys(trendObject).map(Number).sort((a, b) => a - b);

  for (i = 0; i < practices.length; i += 1) {
    practice = common.getObjectByUnderscoreId(practices[i], practiceLookup);
    if (practice) {
      rtn.num.columns.push([practice.short_name]);
      rtn.avg.columns.push([practice.short_name]);
    }
  }

  const innerLoopFunction = (localPracticesMap) => {
    Object.keys(localPracticesMap).forEach((pMap) => {
      ccgNum += localPracticesMap[pMap].i.length > 0 ? localPracticesMap[pMap].i[0].n : 0;
      ccgDenom += localPracticesMap[pMap].i.length > 0 ? localPracticesMap[pMap].i[0].d : 0;
    });
  };

  for (i = 0; i < dates.length; i += 1) {
    numRow = { c: [] };
    avgRow = { c: [] };

    date = common.getDate(dates[i], dateLookup);
    if (date === null) throw new Error('Date lookup failed');

    numRow.c.push({ v: date });
    avgRow.c.push({ v: date });

    rtn.num.columns[0].push(date);
    rtn.avg.columns[0].push(date);

    practicesMap = trendObject[dates[i]];

    // calculate the CCG average
    ccgNum = 0;
    ccgDenom = 0;
    innerLoopFunction(practicesMap);
    avgRow.c.push({ v: ccgDenom > 0 ? 100 * (ccgNum / ccgDenom) : 0 });
    rtn.avg.columns[1].push(ccgDenom > 0 ? 100 * (ccgNum / ccgDenom) : 0);

    let practiceNum = 0;
    for (j = 0; j < practices.length; j += 1) {
      practice = practicesMap[practices[j]];

      if (common.getObjectByUnderscoreId(practices[j], practiceLookup)) {
        practiceNum += 1;
        if (practice) {
          numRow.c.push({ v: practice.i.length > 0 ? practice.i[0].n : 0 });
          avgRow.c.push({
            v: practice.i.length > 0 && practice.i[0].d > 0
              ? 100 * (practice.i[0].n / practice.i[0].d)
              : 0,
          });
          rtn.num.columns[practiceNum].push(practice.i.length > 0 ? practice.i[0].n : 0);
          rtn.avg.columns[practiceNum + 1].push(practice.i.length > 0 && practice.i[0].d > 0
            ? 100 * (practice.i[0].n / practice.i[0].d)
            : 0);
        } else {
          numRow.c.push({ v: 0 });
          avgRow.c.push({ v: 0 });
          rtn.num.columns[practiceNum].push(0);
          rtn.avg.columns[practiceNum + 1].push(0);
        }
      }
    }
  }

  return rtn;
};

const getTrendDataForAllIndicators = (allReports, practiceLookup, dateLookup) => {
  let i;
  let k;
  let practice;
  let dateReports;
  let dateReport;
  let ccgAffected;
  let ccgEligible;

  const rtn = { num: { x: 'x', columns: [['x']] }, avg: { x: 'x', columns: [['x'], ['CCG Avg']] }, patientsMultiple: { x: 'x', columns: [['x']] } };

  // Assume that reports array includes a report for each practice.
  for (i = 0; i < practiceLookup.length; i += 1) {
    practice = practiceLookup[i];

    rtn.num.columns.push([practice.short_name]);
    rtn.avg.columns.push([practice.short_name]);
    rtn.patientsMultiple.columns.push([practice.short_name]);
  }

  const fnOutside = result => result.dateId === dateLookup[i]._id;

  for (i = 0; i < dateLookup.length; i += 1) {
    const { date } = dateLookup[i];

    rtn.num.columns[0].push(date);
    rtn.avg.columns[0].push(date);
    rtn.patientsMultiple.columns[0].push(date);

    dateReports = allReports.filter(fnOutside);

    // calculate the CCG averages
    ccgAffected = 0;
    ccgEligible = 0;
    for (k = 0; k < dateReports.length; k += 1) {
      dateReport = dateReports[k];
      ccgAffected += dateReport.affected;
      ccgEligible += dateReport.eligible;
    }

    rtn.avg.columns[1].push(ccgEligible > 0 ? (100 * ccgAffected) / ccgEligible : 0);

    for (k = 0; k < practiceLookup.length; k += 1) {
      dateReport = common.getObjectByPracticeId(practiceLookup[k]._id, dateReports);
      if (dateReport === null) {
        dateReport = { affectedUnique: 0, eligible: 0, affected: 0, multiple: 0 };
      }

      rtn.num.columns[k + 1].push(dateReport.affectedUnique);
      rtn.avg.columns[k + 2].push(dateReport.eligible > 0
        ? (100 * dateReport.affected) / dateReport.eligible
        : 0);
      rtn.patientsMultiple.columns[k + 1].push(dateReport.multiple);
    }
  }

  return rtn;
};

const getMatchingEpisode = (episodes, date, patientId, indicatorId) => {
  let episode = null;

  if (date === null) {
    return episode;
  }

  const time = date.getTime();

  const filteredEpisodes = episodes.filter(ep => ep.p === patientId
    && ep.i === indicatorId
    && ep.s.getTime() <= time
    && (ep.e === undefined || ep.e.getTime() >= time));

  if (filteredEpisodes.length > 0) {
    [episode] = filteredEpisodes;
  }
  return episode;
};

const tableDataForNumerator = (indicatorId, reports, dateLookup) => {
  let i;
  let currentIndicator;
  let previousIndicator;
  let num = 0;
  let previousNum = 0;
  let trendValue = 0;
  let trend = '';
  let date = '';

  const rtn = [];

  // Ensure reports are ordered in descending date order
  const sortedReports = reports.sort((a, b) => b.dateId - a.dateId);

  for (i = 0; i < sortedReports.length - 1; i += 1) {
    currentIndicator = common.getObjectById(indicatorId, sortedReports[i].i);
    previousIndicator = common.getObjectById(indicatorId, sortedReports[i + 1].i);
    num = currentIndicator === null ? 0 : currentIndicator.n;
    previousNum = previousIndicator === null ? 0 : previousIndicator.n;
    trendValue = num - previousNum;
    date = common.getDate(sortedReports[i].dateId, dateLookup);
    if (date === null) throw new Error('Date lookup failed');

    if (trendValue > 0) {
      trend = 'up-negative';
    } else if (trendValue < 0) {
      trend = 'down-positive';
    } else {
      trend = 'no-change';
    }

    rtn.push({
      date,
      num,
      trendValue,
      trend,
    });
  }
  return rtn;
};

const tableDataForResolved = (indicatorId, reports, dateLookup) => {
  let i;
  let currentIndicator;
  let previousIndicator;
  let prePreviousIndicator;
  let num = 0;
  let previousNum = 0;
  let trendValue = 0;
  let trend = '';
  let date = '';

  const rtn = [];

  // Ensure reports are ordered in descending date order
  const sortedReports = reports.sort((a, b) => b.dateId - a.dateId);

  for (i = 0; i < sortedReports.length - 2; i += 1) {
    currentIndicator = common.getObjectById(indicatorId, sortedReports[i].i);
    previousIndicator = common.getObjectById(indicatorId, sortedReports[i + 1].i);
    prePreviousIndicator = common.getObjectById(indicatorId, sortedReports[i + 2].i);
    num = common.getResolvedCases(
      currentIndicator === null ? [] : currentIndicator.p,
      previousIndicator === null ? [] : previousIndicator.p
    ).length;
    previousNum = common.getResolvedCases(
      previousIndicator === null ? [] : previousIndicator.p,
      prePreviousIndicator === null ? [] : prePreviousIndicator.p
    ).length;
    trendValue = num - previousNum;
    date = common.getDate(sortedReports[i].dateId, dateLookup);
    if (date === null) throw new Error('Date lookup failed');

    if (trendValue > 0) {
      trend = 'up-positive';
    } else if (trendValue < 0) {
      trend = 'down-negative';
    } else {
      trend = 'no-change';
    }

    rtn.push({
      date,
      num,
      trendValue,
      trend,
    });
  }
  return rtn;
};

const tableDataForNew = (indicatorId, reports, dateLookup) => {
  let i;
  let currentIndicator;
  let previousIndicator;
  let prePreviousIndicator;
  let num = 0;
  let previousNum = 0;
  let trendValue = 0;
  let trend = '';
  let date = '';

  const rtn = [];

  // Ensure reports are ordered in descending date order
  const sortedReports = reports.sort((a, b) => b.dateId - a.dateId);

  for (i = 0; i < sortedReports.length - 2; i += 1) {
    currentIndicator = common.getObjectById(indicatorId, sortedReports[i].i);
    previousIndicator = common.getObjectById(indicatorId, sortedReports[i + 1].i);
    prePreviousIndicator = common.getObjectById(indicatorId, sortedReports[i + 2].i);
    num = common.getNewCases(
      currentIndicator === null ? [] : currentIndicator.p,
      previousIndicator === null ? [] : previousIndicator.p
    ).length;
    previousNum = common.getNewCases(
      previousIndicator === null ? [] : previousIndicator.p,
      prePreviousIndicator === null ? [] : prePreviousIndicator.p
    ).length;
    trendValue = num - previousNum;
    date = common.getDate(sortedReports[i].dateId, dateLookup);
    if (date === null) throw new Error('Date lookup failed');

    if (trendValue > 0) {
      trend = 'up-negative';
    } else if (trendValue < 0) {
      trend = 'down-positive';
    } else {
      trend = 'no-change';
    }

    rtn.push({
      date,
      num,
      trendValue,
      trend,
    });
  }
  return rtn;
};

const tableDataForExisting = (indicatorId, reports, dateLookup) => {
  let i;
  let currentIndicator;
  let previousIndicator;
  let prePreviousIndicator;
  let num = 0;
  let previousNum = 0;
  let trendValue = 0;
  let trend = '';
  let date = '';

  const rtn = [];

  // Ensure reports are ordered in descending date order
  const sortedReports = reports.sort((a, b) => b.dateId - a.dateId);

  for (i = 0; i < sortedReports.length - 2; i += 1) {
    currentIndicator = common.getObjectById(indicatorId, sortedReports[i].i);
    previousIndicator = common.getObjectById(indicatorId, sortedReports[i + 1].i);
    prePreviousIndicator = common.getObjectById(indicatorId, sortedReports[i + 2].i);
    num = common.getExistingCases(
      currentIndicator === null ? [] : currentIndicator.p,
      previousIndicator === null ? [] : previousIndicator.p
    ).length;
    previousNum = common.getExistingCases(
      previousIndicator === null ? [] : previousIndicator.p,
      prePreviousIndicator === null ? [] : prePreviousIndicator.p
    ).length;
    trendValue = num - previousNum;
    date = common.getDate(sortedReports[i].dateId, dateLookup);
    if (date === null) throw new Error('Date lookup failed');

    if (trendValue > 0) {
      trend = 'up-negative';
    } else if (trendValue < 0) {
      trend = 'down-positive';
    } else {
      trend = 'no-change';
    }

    rtn.push({
      date,
      num,
      trendValue,
      trend,
    });
  }
  return rtn;
};

const getTableDataForPatients = (indicatorId, trendReports, trendDates, reportType) => {
  let rtn = [];

  if (reportType === 'resolved') {
    rtn = tableDataForResolved(indicatorId, trendReports, trendDates);
  } else if (reportType === 'existing') {
    rtn = tableDataForExisting(indicatorId, trendReports, trendDates);
  } else if (reportType === 'new') {
    rtn = tableDataForNew(indicatorId, trendReports, trendDates);
  } else if (reportType === 'numerator') {
    rtn = tableDataForNumerator(indicatorId, trendReports, trendDates);
  }

  return rtn;
};

const getChartDataForPatients = (tableData) => {
  let i;
  let r = {};
  let entry = {};

  const rtn = {
    cols: [],
    rows: [],
  };

  rtn.cols.push({
    id: 'date',
    label: 'Date',
    type: 'date',
  });

  rtn.cols.push({
    id: 'value',
    label: '',
    type: 'number',
  });

  for (i = 0; i < tableData.length; i += 1) {
    entry = tableData[i];

    r = { c: [] };
    r.c.push({ v: entry.date });
    r.c.push({ v: entry.num });

    rtn.rows.push(r);
  }

  return rtn;
};

const getPatientsData = (
  patientIds, report, practice,
  indicatorLookup, dateLookup,
  patientLookup, episodes
) => {
  // it is valid for patientIds and episodes to be
  // empty arrays (i.e. when no patients trigger the indicator)

  let i = 0;
  let j = 0;
  const patients = [];
  let patient = {};
  let indicator = {};
  let ind = {};
  let indicators = [];
  let episode = {};
  let currentPatient = {};

  let rtn = [];

  let date = common.getDate(report.dateId, dateLookup);
  if (date === null) throw new Error('Date lookup failed');
  date = new Date(date); // TODO DATE

  const fnOutside = result => result.p.indexOf(patientIds[i]) > -1;

  for (i = 0; i < patientIds.length; i += 1) {
    patient = {};
    patient.id = patientIds[i];
    currentPatient = common.getObjectByUnderscoreId(patientIds[i], patientLookup);
    patient.nhs = currentPatient.nhs;
    patient.patientNote = currentPatient.patientNote;
    patient.patientNoteUpdated = currentPatient.patientNoteUpdated;
    patient.patientNoteUpdatedBy = currentPatient.patientNoteUpdatedBy;
    patient.patientNoteUpdatedLocaleString = currentPatient.patientNoteUpdated
      ? new Date(currentPatient.patientNoteUpdated).toISOString().split('T').map((v) => {
        if (v.indexOf('-') > -1) {
          return `${v.split('-')[2]}/${v.split('-')[1]}/${v.split('-')[0]}`;
        }
        return v.substr(0, 8);
      })
        .join(', ')
      : '';
    patient.indicatorNotes = currentPatient.indicatorNotes;
    patient.indicators = [];

    indicators = report.i.filter(fnOutside);

    for (j = 0; j < indicators.length; j += 1) {
      if (common.isIndicatorUsed(indicators[j].id, practice)) {
        indicator = {};
        indicator.id = indicators[j].id;
        ind = common.getObjectByUnderscoreId(indicators[j].id, indicatorLookup);
        if (ind !== null) { // should not be null as indicator list is static
          indicator.short_name = ind.short_name;
          indicator.long_name = ind.long_name;

          episode = getMatchingEpisode(episodes, date, patient.id, indicator.id);
          indicator.since = episode === null ? '' : episode.s;

          patient.indicators.push(indicator);
        }
      }
    }

    patients.push(patient);
  }

  const sortedPatients = patients.sort((a, b) => a.indicators.length - b.indicators.length);

  rtn = sortedPatients;
  return rtn;
};

exports.listIndicators = (req, res, next) => {
  indicatorCtrl.list()
    .then(indicators => res.send(indicators))
    .catch(err => next(err));
};

exports.listPractices = (req, res, next) => {
  practiceCtrl.list()
    .then(practices => res.send(practices))
    .catch(err => next(err));
};

exports.listDates = (req, res, next) => {
  dateCtrl.list()
    .then(dates => res.send(dates))
    .catch(err => next(err));
};

exports.listDatesForDisplay = (req, res, next) => {
  dateCtrl.listForDisplay()
    .then(dates => res.send(dates))
    .catch(err => next(err));
};

exports.getSingleIndicatorData = async (req, res, next) => {
  const data = await getSingleIndicatorData(req, res, next);
  const rtn = {};

  try {
    const { reports, practiceLookup, indicatorId, comparisonReports } = data;
    const { ccgAverages, trends, datesForChart } = data;
    rtn.tableData = getTableDataForSingleIndicator(
      indicatorId, reports,
      comparisonReports, practiceLookup, ccgAverages
    );
    rtn.trendChartData = getTrendChartDataForSingleIndicator(trends, practiceLookup, datesForChart);
    res.json(rtn);
  } catch (e) {
    common.logError('[single-practice-api-controller] [exports.data] Error processing data: ', e);
    common.respondWithError(res, e);
  }
};

exports.getAllIndicatorData = async (req, res, next) => {
  const data = await getAllIndicatorData(req, res, next);
  const rtn = {};

  try {
    const { reports, practiceLookup, allReports, datesForChart } = data;
    rtn.tableData = getTableDataForAllIndicators(reports, practiceLookup);
    rtn.trendChartData = getTrendDataForAllIndicators(allReports, practiceLookup, datesForChart);
    res.json(rtn);
  } catch (e) {
    common.logError('[single-practice-api-controller] [exports.data] Error processing data: ', e);
    common.respondWithError(res, e);
  }
};

exports.getPatientData = async (req, res, next) => {
  const data = await getPatientData(req, res, next);
  const rtn = {};

  try {
    const { report, patientIds, practice, indicatorLookup, practiceId, dateId } = data;
    const { dateLookup, patientLookup, episodes, comparisonDateId, indicatorId } = data;
    const { trendReports, trendDates, reportType, indicator } = data;
    rtn.practiceId = practiceId;
    rtn.dateId = dateId;
    rtn.comparisonDateId = comparisonDateId;
    rtn.indicatorId = indicatorId;
    rtn.indicator = indicator;
    rtn.patients = getPatientsData(
      patientIds, report, practice, indicatorLookup,
      dateLookup, patientLookup, episodes
    );
    rtn.tableData = getTableDataForPatients(indicatorId, trendReports, trendDates, reportType);
    rtn.chartData = getChartDataForPatients(rtn.tableData);
    res.json(rtn);
  } catch (e) {
    common.logError('[single-practice-api-controller] [exports.data] Error processing data: ', e);
    common.respondWithError(res, e);
  }
};

exports.getMultiplePatientData = async (req, res, next) => {
  const data = await getMultiplePatientData(req, res, next);
  const rtn = {};

  try {
    const { report, patientIds, practice, indicatorLookup, practiceId, dateId } = data;
    const { dateLookup, patientLookup, episodes } = data;
    rtn.practiceId = practiceId;
    rtn.dateId = dateId;
    rtn.patients = getPatientsData(
      patientIds, report, practice, indicatorLookup,
      dateLookup, patientLookup, episodes
    );
    res.json(rtn);
  } catch (e) {
    common.logError('[single-practice-api-controller] [exports.data] Error processing data: ', e);
    common.respondWithError(res, e);
  }
};

exports.getPracticeData = async (req, res, next) => {
  const data = await getPracticeData(req, res, next);
  const rtn = {};

  try {
    const { report, comparisonReport, practice, indicatorLookup, practiceId, dateId } = data;
    const { ccgAverages, allReports, datesForChart, comparisonDateId } = data;
    rtn.practiceId = practiceId;
    rtn.dateId = dateId;
    rtn.comparisonDateId = comparisonDateId;
    rtn.tableData = getTableData(report, comparisonReport, practice, indicatorLookup, ccgAverages);
    rtn.summaryData = getSummaryData(report, practice);
    rtn.trendChartData = getTrendChartData(allReports, practice, indicatorLookup, datesForChart);
    res.json(rtn);
  } catch (e) {
    common.logError('[single-practice-api-controller] [exports.data] Error processing data: ', e);
    common.respondWithError(res, e);
  }
};

exports.exportPracticeData = async (req, res, next) => {
  const data = await getPracticeData(req, res, next);
  // RW - special characters are not correctly displayed in excel.

  // After investigation:
  /* - Notepad+=1 correctly opens the files - it is just excel that doesn't
    - The issue is to do with UTF8 vs UTF8 + BOM
    - Without BOM excel doesn't correctly interpret characters that are outside UTF8
    - Most other text viewers don't need the BOM and just know that if they see a character
      like 11000001 then it means (use the next 2 bytes), 11100001 (use the next 3 bytes) etc.
    - setting the charset differently doesn't seem to work
    - prepending '\xEF\xBB\xBF' doesn't work
    - this fiddle (http://jsfiddle.net/W432s/) for a client side download works but can't see how to
      translate it to server side
    - I will leave for now but possiblities are:
        o export as Excel using a different library
        o export as tab delimited?
        o translate the special characters prior to sending e.g. ? -> Women, ? -> >=
  */
  json2csv(
    {
      data: getTableData(
        data.report, data.comparisonReport, data.practice,
        data.indicatorLookup, data.ccgAverages, data.sortBy, data.sortReverse
      ),
      fields: ['short_name', 'num', 'denom', 'avg', 'ccg', 'resolved', 'existing', 'new', 'trendValue'],
      fieldNames: ['Indicator', 'Affected patients', 'Eligible patients', '% of eligible patients affected', 'CCG Avg (%)', 'Successful intervention', 'Action pending', 'New cases', 'Trend'],
    },
    (err, csv) => {
      const metadata = getMetaData(
        data.practiceId, data.practiceLookup,
        data.dateId, data.comparisonDateId, data.dateLookup
      );
      res.attachment('PatientSafety-Dashboard-SinglePractice-SingleIndicator.csv');
      res.end(metadata + csv, 'utf8');
    }
  );
};
