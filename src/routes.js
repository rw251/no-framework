// If lots of routes then split into files in a
// directory called 'routes'
import { index, about, products } from './controllers';

exports.routes = {
  about: { controller: about, regex: /about/ },
  products: { controller: products, regex: /products\/(.*)\/edit\/(.*)/ },
  default: { controller: index, regex: /.*/ },
};
