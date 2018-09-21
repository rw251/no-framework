const config = require('../config');

exports.getGlobalData = user => ({
  urls: {
    action: config.actionURL,
    ours: config.ourURL,
  },
  global: {
    authenticated: user,
    isAdmin: user && user.roles && user.roles.indexOf('admin') > -1,
    user,
  },
  breadcrumbs: [],
});
