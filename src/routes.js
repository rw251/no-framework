// If lots of routes then split into files in a
// directory called 'routes'
import about from './controllers/aboutController';
import products from './controllers/productController';
import home from './controllers/homeController';

export default [
  { controller: about, regex: /about/ },
  { controller: products, regex: /products\/(.*)\/edit\/(.*)/ },
  { controller: home, regex: /.*/, isDefault: true },
];
