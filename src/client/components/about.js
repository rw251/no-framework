import Template from 'rw-templater';
import './about.scss';

export default function (callback) {
  document.querySelector('a.active').classList.remove('active');
  document.querySelector('#nav-tab-2').classList.add('active');

  document.getElementById('main').innerHTML = Template.it('about', {
    name: 'Richard',
    age: 36,
  });

  if (callback) callback();
}
