// If lots of routes then split into files in a
// directory called 'routes'
import ccg from './controllers/ccgController';
import evidence from './controllers/evidenceController';
import help from './controllers/helpController';
import practice from './controllers/practiceController';
import practiceIndicator from './controllers/practiceIndicatorController';

export default [
  { controller: practice, regex: /''/, isDefault: true },

  // /practice/:practiceId/date/:dateId/comparedWith/:comparisonDateId/indicator/:indicatorId/:reportType/tab/:tabId
  { controller: practiceIndicator, regex: /practice\/(.*)\/date\/(.*)\/comparedWith\/(.*)\/indicator\/(.*)\/(.*)\/tab\/(.*)/ },
  { controller: practiceIndicator, regex: /practice\/(.*)\/date\/(.*)\/comparedWith\/(.*)\/indicator\/(.*)\/(.*)/ },
  { controller: practiceIndicator, regex: /practice\/(.*)\/date\/(.*)\/comparedWith\/(.*)\/indicator\/(.*)/ },

  { controller: practice, regex: /practice\/(.*)\/date\/(.*)\/comparedWith\/(.*)\/tab\/(.*)/ },
  { controller: practice, regex: /practice/ },

  { controller: ccg, regex: /ccg\/?(.*)/ },

  { controller: evidence, regex: /evidence\/?(.*)/ },

  { controller: help, regex: /help/ },
];
