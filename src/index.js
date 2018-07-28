import { Router } from './rw-router';
import { Template } from './rw-templater';
import { Progress } from './rw-progress';
import './styles.scss';

Router.config();
let latest = '';
// adding routes
Router
  .add(/about/, () => {
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
  })
  .add(/products\/(.*)\/edit\/(.*)/, () => {
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
  })
  .add('', () => {
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
  })
  .listen();

Router.navigate(window.location.pathname);