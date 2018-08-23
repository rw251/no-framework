// If lots of routes then split into files in a
// directory called 'routes'
import { practice, about, products } from './controllers';

exports.routes = {
  practice: { controller: practice, regex: /page\/practice/ },
  practice: { controller: practice, regex: /page\/practice/ },
  products: { controller: products, regex: /products\/(.*)\/edit\/(.*)/ },
  default: { controller: about, regex: /.*/ },
};
