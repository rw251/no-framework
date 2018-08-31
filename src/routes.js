// If lots of routes then split into files in a
// directory called 'routes'
import ccg from './controllers/ccgController';
import evidence from './controllers/evidenceController';
import help from './controllers/helpController';
import practice from './controllers/practiceController';
import practiceIndicator from './controllers/practiceIndicatorController';
import multiplePatients from './controllers/multiplePatientsController';

export default [
  { controller: practice, regex: /''/, isDefault: true },

  { controller: multiplePatients, regex: /practice\/(.*)\/date\/(.*)\/multiple/ },

  // /practice/:practiceId/date/:dateId/comparedWith/:comparisonDateId/indicator/:indicatorId/:reportType/tab/:tabId/show/:chartOrTable
  { controller: practiceIndicator, regex: /practice\/(.*)\/date\/(.*)\/comparedWith\/(.*)\/indicator\/(.*)\/(.*)\/show\/(.*)\/tab\/(.*)/ },
  { controller: practiceIndicator, regex: /practice\/(.*)\/date\/(.*)\/comparedWith\/(.*)\/indicator\/(.*)\/(.*)\/show\/(.*)/ },
  { controller: practiceIndicator, regex: /practice\/(.*)\/date\/(.*)\/comparedWith\/(.*)\/indicator\/(.*)\/(.*)/ },
  { controller: practiceIndicator, regex: /practice\/(.*)\/date\/(.*)\/comparedWith\/(.*)\/indicator\/(.*)/ },

  { controller: practice, regex: /practice\/(.*)\/date\/(.*)\/comparedWith\/(.*)\/tab\/(.*)/ },
  { controller: practice, regex: /practice/ },

  { controller: ccg, regex: /ccg\/date\/(.*)\/comparedWith\/(.*)\/tab\/(.*)\/indicator\/(.*)/ },
  { controller: ccg, regex: /ccg\/date\/(.*)\/comparedWith\/(.*)\/tab\/(.*)/ },
  { controller: ccg, regex: /ccg/ },

  { controller: evidence, regex: /evidence\/?(.*)/ },

  { controller: help, regex: /help/ },
];
