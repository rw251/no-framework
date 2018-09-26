const express = require('express');
const userController = require('../controllers/user');
const apiController = require('../controllers/api');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  return next();
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated()) { return next(); }

  req.session.redirect_to = req.path; // remember the page they tried to load

  return res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  return next();
  if (req.user.roles.indexOf('admin') > -1) return next();
  return res.redirect('/login');
};

require('../passport');

// api methods for returning JSON data to populate some views
router.get('/users', isAuthenticated, isAdmin, userController.listJSON);
router.get('/users/:email', isAuthenticated, isAdmin, userController.getJSON);
router.get('/practices', isAuthenticated, apiController.listPractices);
router.get('/indicators', isAuthenticated, apiController.listIndicators);
router.get('/dates', isAuthenticated, apiController.listDates);
router.get('/datesForDisplay', isAuthenticated, apiController.listDatesForDisplay);

router.get('/practice/:practiceId/summaryfordate/:dateId/comparedWith/:comparisonDateId', isAuthenticated, apiController.getPracticeData);
router.get('/practice/:practiceId/summaryfordate/:dateId/comparedWith/:comparisonDateId/export', isAuthenticated, apiController.exportPracticeData);

router.get('/patients/:practiceId/:dateId/:comparisonDateId/:indicatorId/:reportType', isAuthenticated, apiController.getPatientData);
router.get('/patients/:practiceId/multiple/on/:dateId', isAuthenticated, apiController.getMultiplePatientData);

router.get('/indicator/all/summaryfordate/:dateId', isAuthenticated, apiController.getAllIndicatorData);
router.get('/indicator/all/summaryfordate/:dateId/export', isAuthenticated, apiController.exportCcgAllIndicatorData);
router.get('/indicator/:indicatorId/summaryfordate/:dateId/comparedWith/:comparisonDateId', isAuthenticated, apiController.getSingleIndicatorData);
router.get('/indicator/:indicatorId/summaryfordate/:dateId/comparedWith/:comparisonDateId/export', isAuthenticated, apiController.exportCcgSingleIndicatorData);

router.post('/note', isAuthenticated, apiController.updatePatientNote);
router.delete('/note/:patientId', isAuthenticated, apiController.deletePatientNote);

/* GET home page. */
router.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Parcel Pending API', data: { version_number: 'v1.0.0' } });
});

// router.post('/users', UserController.create); // C
// router.get('/users', passport.authenticate('jwt', { session: false }), UserController.get); // R
module.exports = router;
