import Template from 'rw-templater';
import './about.scss';

export default function (callback) {
  document.querySelector('a.active').classList.remove('active');
  document.querySelector('#nav-tab-2').classList.add('active');

  const data = {
    name: 'Richard',
    age: 36,
  };

  document.getElementById('main').innerHTML = Template.it('about', data);

  // OR DO IT ALL WITH STRING LITERALS
  //
  // document.getElementById('main').innerHTML = `
  //   <p class="about-tmpl">ABOUT: Hello, my name is ${data.name}. I'm ${data.age} years old.</p>
  // `;

  if (callback) callback();
}
