import Template from 'rw-templater';
import state from '../state';

export default (callback, productId, editId) => {
  // always start a progress bar if there is any async
  // behaviour loading the content.
  window.Progress.start();
  state.latestPageRequestId = Math.random();
  const localPageRequestId = state.latestPageRequestId;
  setTimeout(() => {
    if (state.latestPageRequestId === localPageRequestId) {
      window.Progress.done();
      document.querySelector('a.active').classList.remove('active');
      document.querySelector('#nav-tab-4').classList.add('active');

      const data = {
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
      };

      document.getElementById('main').innerHTML = Template.it('products', data);

      // OR DO IT ALL WITH STRING LITERALS
      //
      // const fruits = data.isFruit && `<ul>${data.fruit
      //  .map(v => `<li>${v.name} are ${v.colour}</li>`).join('')}</ul>`;
      // const cars = data.isCars && `<ul>${data.cars
      //  .map(v => `<li>${v.name}s are ${v.speed}</li>`).join('')}</ul>`;

      // document.getElementById('main').innerHTML = `
      //   <p>Some fruit if isFruit is true:<p>
      //   ${fruits}
      //   <p>Some cars if isCars is true:</p>
      //   ${cars}
      // `;
    }

    if (callback) callback();
  }, 500);
};
