import { Router } from 'rw-router';
import routes from './routes';
import './styles.scss';

// The main entry point for the js code

// Initialize the router
Router.config();

// This script is only called on a server load so we might
// need to do some client routing

// First get the path
const trimmedPath = window.location.pathname.replace(/^\/+|\/+$/g, '');

// Now look for a match in the routes
let controller = false;
let defaultController;
routes.forEach((route) => {
  // Add all the routes to the Router
  Router.add(route.regex, route.controller);

  if (controller) return;
  if (route.isDefault) defaultController = route.controller;
  if (route.regex.test(trimmedPath)) {
    ({ controller } = route);
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
