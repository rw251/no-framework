// If lots of controllers then split into files in a
// directory called 'controllers'
import { Template } from 'rw-templater';
import { Progress } from 'rw-progress';
import aboutCmpnt from './components/about';
import 'rw-progress/style.scss';

let latestPage = '';

export function practice(callback, url) {
  console.log(url);
  Progress.start();
  latestPage = '';
  setTimeout(() => {
    if (latestPage === '') {
      Progress.done();
      document.querySelector('a.active').classList.remove('active');
      document.querySelector('#nav-tab-1').classList.add('active');

      document.getElementById('main').innerHTML = Template.it('home');
    }

    if (callback) callback();
  }, 1500);
}

export function about(callback) {
  Progress.start();
  latestPage = 'about';
  aboutCmpnt(() => {
    if (latestPage === 'about') {
      Progress.done();
    }

    if (callback) callback();
  });
}

export function products(callback, productId, editId) {
  Progress.start();
  latestPage = 'products';
  setTimeout(() => {
    if (latestPage === 'products') {
      Progress.done();
      document.querySelector('a.active').classList.remove('active');
      document.querySelector('#nav-tab-4').classList.add('active');

      document.getElementById('main').innerHTML = Template.it('products', {
        productId,
        editId,
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

    if (callback) callback();
  }, 500);
}
