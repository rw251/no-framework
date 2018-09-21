import Router from 'rw-router';
import { Progress } from 'rw-progress';
import routes from './routes';
import state from './state';
import './styles.scss';
import 'rw-progress/style.scss';

const P = require('bluebird');
const $ = require('jquery');

if (!window.Promise) window.Promise = P;

window.$ = $;
window.jQuery = $;
window.Progress = Progress;
require('bootstrap');
require('bootstrap-select');
require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-buttons/js/buttons.colVis.js')(window, $);
require('datatables.net-buttons/js/buttons.html5.js')(window, $);

global.Router = Router;

// The main entry point for the js code

// Initialize the router
Router.config();

// This script is only called on a server load so we might
// need to do some client routing

// First get the path
const trimmedPath = window.location.pathname.replace(/^\/+|\/+$/g, '');

// Now look for a match in the routes
let controller = false;
let parameters = [null];
let defaultController;
routes.forEach((route) => {
  // Add all the routes to the Router
  Router.add(route.regex, route.controller);

  if (controller) return;
  if (route.isDefault) defaultController = route.controller;
  const result = trimmedPath.match(route.regex);
  if (result) {
    ({ controller } = route);
    parameters = result;
  }
});

// Start the router listening
Router.listen();

if (!controller) {
  // Shouldn't actually get here - but if we do
  // just load the homepage
  controller = defaultController;
}
const initialize = () => {
  parameters[0] = () => {
    // unhide everything on initial page load after content is generated
    document.getElementById('container').style.display = '';
    // ensure headers display correctly on hidden tab
    state.redrawTables();
  };
  controller.apply({}, parameters);
};

if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
  // dom loaded so safe to call controller
  initialize();
} else {
  // dom not loaded so let's wait before firing the controller
  document.addEventListener('DOMContentLoaded', initialize);
}
