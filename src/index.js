import { Router } from './rw-router';
import { Template } from './rw-templater';
import { Progress } from './rw-progress';
import './styles.scss';


let latest = '';

const index = () => {
  Progress.start();
  latest = '';
  setTimeout(() => {
    if (latest === '') {
      Progress.done();
      document.querySelector('a.active').classList.remove('active');
      document.querySelector('#nav-tab-1').classList.add('active');

      document.getElementById('main').innerHTML = Template.it('home');
    }
  }, 1500);
};

const about = () => {
  Progress.start();
  latest = 'about';
  setTimeout(() => {
    if (latest === 'about') {
      Progress.done();
      document.querySelector('a.active').classList.remove('active');
      document.querySelector('#nav-tab-2').classList.add('active');

      document.getElementById('main').innerHTML = Template.it('about', {
        name: 'Richard',
        age: 36,
      });
    }
  }, 200);
};

const products = () => {
  Progress.start();
  latest = 'products';
  setTimeout(() => {
    if (latest === 'products') {
      Progress.done();
      document.querySelector('a.active').classList.remove('active');
      document.querySelector('#nav-tab-4').classList.add('active');

      document.getElementById('main').innerHTML = Template.it('loopBoolTest', {
        isFruit: Math.random() > 0.5,
        fruit: [
          { name: 'apples', colour: 'green' },
          { name: 'oranges', colour: 'orange' },
          { name: 'bananas', colour: 'yellow' },
        ],
        isCars: Math.random() > 0.5,
        cars: [
          { name: 'mini', speed: 'slow' },
          { name: 'civic', speed: 'medium' },
          { name: 'porsche', speed: 'fast' },
        ],
      });
    }
  }, 500);
};

Router.config();
// adding routes
Router
  .add(/about/, about)
  .add(/products\/(.*)\/edit\/(.*)/, products)
  .add('', index)
  .listen();

const trimmedPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
switch (trimmedPath) {
  case 'about':
    about();
    break;
  default:
    index();
}
