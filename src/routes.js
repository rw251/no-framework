// If lots of routes then split into files in a
// directory called 'routes'
import { index, about, products } from './controllers';

export default [
  { controller: about, regex: /about/ },
  { controller: products, regex: /products\/(.*)\/edit\/(.*)/ },
  { controller: index, regex: /.*/, isDefault: true },
];
