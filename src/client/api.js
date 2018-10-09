import state from './state';

export default {
  getAbout: () => {
    // if promise already exists return it
    if (state.about) return state.about;

    // create promise (would use fetch from an api probably)
    state.about = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: 'Richard',
          age: 36,
        });
      });
    }, 500);

    // return the promise
    return state.about;
  },

  getHome: () => {
    // if promise already exists return it
    if (state.home) return state.home;

    // create promise (would use fetch from an api probably)
    state.home = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: 'Richard',
          age: 36,
        });
      });
    }, 1500);

    // return the promise
    return state.home;
  },

  getProduct: (productId, editId) => new Promise((resolve) => {
    setTimeout(() => {
      resolve({
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
    });
  }, 1500),
};
