import { Router } from 'rw-router';
import { routes } from './routes';
import './styles.scss';

const $ = require('jquery');

window.$ = $;
window.jQuery = $;
require('bootstrap');
require('bootstrap-select');

// The main entry point for the js code

// Initialize the router
Router.config();

// This script is only called on a server load so we might
// need to do some client routing

// First get the path
const trimmedPath = window.location.pathname.replace(/^\/+|\/+$/g, '');

// Now look for a match in the routes
let controller = false;
Object.keys(routes).forEach((route) => {
  // Add all the routes to the Router
  Router.add(routes[route].regex, routes[route].controller);

  if (controller) return;
  if (routes[route].regex.test(trimmedPath)) {
    ({ controller } = routes[route]);
  }
});

// Start the router listening
Router.listen();

if (!controller) {
  // Shouldn't actually get here - but if we do
  // just load the homepage
  controller = routes.default.controller();
}
const initialize = () => {
  controller(() => {
    document.getElementById('container').style.display = '';
  });
};

if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
  // dom loaded so safe to call controller
  initialize();
} else {
  // dom not loaded so let's wait before firing the controller
  document.addEventListener('DOMContentLoaded', initialize);
}
