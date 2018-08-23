// If lots of routes then split into files in a
// directory called 'routes'
import { practice, products } from './controllers';

export default [
  { controller: practice, regex: /''/, isDefault: true },
  { controller: practice, regex: /page\/practice\/?(.*)/ },
  { controller: products, regex: /products\/(.*)\/edit\/(.*)/ },
];
