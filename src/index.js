import Router from 'rw-router';
import { Progress } from 'rw-progress';
import routes from './routes';
import './styles.scss';
import 'rw-progress/style.scss';

window.Progress = Progress;

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
    document.getElementById('container').style.display = '';
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
