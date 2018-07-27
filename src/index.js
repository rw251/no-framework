import { Router } from './rw-router';
import { Template } from './rw-templater';
import { Progress } from './rw-progress';

Router.config();
Router.navigate();
let latest = '';
// adding routes
Router
  .add(/about/, () => {
    Progress.start();
    latest = 'about';
    setTimeout(() => {
      if (latest === 'about') {
        Progress.done();

        document.getElementById('main').innerHTML = Template.it('about', {
          name: 'Krasimir',
          age: 29,
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

        document.getElementById('main').innerHTML = Template.it('<p>HOME: Hello, my name is {{name}}. I\'m {{age}} years old.</p>', {
          name: 'Krasimir',
          age: 29,
        });
      }
    }, 1500);
  })
  .listen();
