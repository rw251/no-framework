import './about.scss';

export default data => `
    <p class="about-tmpl">ABOUT: Hello, my name is ${data.name}. I'm ${data.age} years old.</p>
  `;
