module.exports = {

  getNewCases(patients = [], comparisonPatients = []) {
    const newPatients = patients.filter(patient => comparisonPatients.indexOf(patient) < 0);
    return newPatients;
  },

  getResolvedCases(patients = [], comparisonPatients = []) {
    const resolvedPatients = comparisonPatients.filter(patient => patients.indexOf(patient) < 0);
    return resolvedPatients;
  },

  getExistingCases(patients = [], comparisonPatients = []) {
    const newPatients = patients.filter(patient => comparisonPatients.indexOf(patient) > -1);
    return newPatients;
  },

  getObjectByUnderscoreId(id, lookup = []) {
    for (let i = 0; i < lookup.length; i += 1) {
      if (lookup[i]._id === id) return lookup[i];
    }
    return null;
  },

  getObjectByProperty(prop, id, lookup = []) {
    for (let i = 0; i < lookup.length; i += 1) {
      if (lookup[i][prop] === id) return lookup[i];
    }
    return null;
  },

  getObjectById(id, lookup = []) {
    const matches = lookup.filter(entry => entry.id === id);
    return matches.length > 0 ? matches[0] : null;
  },

  getObjectByPracticeId(id, lookup = []) {
    const matches = lookup.filter(entry => entry.practiceId === id);
    return matches.length > 0 ? matches[0] : null;
  },

  getDate(dateId, lookup = []) {
    const matches = lookup.filter(entry => entry._id === dateId);
    return matches.length > 0 ? matches[0].date : null;
  },

  respondWithError(res) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain');
    res.end('An error has occurred. Please try to refresh the page. If the problem persists, please contact support@smash.srft.nhs.uk');
  },

  logError(errorText, err) {
    console.log(errorText, err);
  },

  isIndicatorUsed(indicatorId, practice) {
    return (
      !practice.indicators
      || practice.indicators.length === 0
      || practice.indicators.indexOf(indicatorId) >= 0
    );
  },
};
