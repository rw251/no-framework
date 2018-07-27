// Minimalistic templating engine inspired (nicked) largely from https://github.com/premasagar/tim

// Usage
// ```index.html
// <script type='text/rw' id='about'>
//   <p>ABOUT: Hello, my name is {{name}}. I'm {{age}} years old.</p>
// </script>
// <script type='text/rw' id='boolTest'>
//   <div>
//     The next line gives the value of the property isData:
//   </div>
//   {{isData}}
//     THERE IS DATA
//   {{/isData}}
// </script>
//
// <script type="text/rw" id="loopTest">
//   Some fruit:
//   <ul>
//   {{fruit}}
//     <li>{{name}} are {{colour}}</li>
//   {{/fruit}}
//   </ul>
// </script>

// ```file.js
// import { Template } from './rw-templater';

// document.getElementById('main').innerHTML = Template.it('templateId', data);

const pattern = new RegExp('{{\\s*([a-z0-9_$][\\.a-z0-9_]*)\\s*}}', 'gi');

exports.Template = {
  initialized: false,
  templateCache: {},

  addToken(token, data, tag) {
    const path = token.split('.');
    let dataLookup = data;

    for (let i = 0; i < path.length; i += 1) {
      dataLookup = dataLookup[path[i]];

      // Property not found and not at child property
      if (dataLookup === undefined && i !== path.length - 1) {
        throw new Error(`rw: '${path[i]}' not found${i ? ` in ${tag}` : ''}`);
      }
    }

    return dataLookup === undefined ? false : dataLookup;
  },

  extend(obj1, obj2) {
    Object.keys(obj2).forEach((key) => { obj1[key] = obj2[key]; });
    return obj1;
  },

  substitute(template, data) {
    let templateString = template;
    let match = pattern.exec(templateString);
    while (match !== null) {
      const [, token] = match;
      const substituted = this.addToken(token, data, templateString);
      const startPos = match.index;
      const endPos = pattern.lastIndex;
      const templateStart = templateString.slice(0, startPos);
      let templateEnd = templateString.slice(endPos);

      if (typeof substituted !== 'boolean' && typeof substituted !== 'object') {
        templateString = templateStart + substituted + templateEnd;
      } else {
        const closeToken = `{{/${token}}}`;
        const closePos = templateEnd.indexOf(closeToken);

        if (closePos >= 0) {
          let subTemplate = '';
          templateEnd = templateEnd.slice(0, closePos);

          if (typeof substituted === 'boolean') {
            subTemplate = substituted ? templateEnd : '';
          } else {
            Object.keys(substituted).forEach((key) => {
              pattern.lastIndex = 0;
              subTemplate += this.it(
                templateEnd,
                this.extend({ _key: key, _content: substituted[key] }, substituted[key])
              );
            });
          }
          templateString = templateStart
            + subTemplate
            + templateString.slice(endPos + templateEnd.length + closeToken.length);
        } else {
          throw new Error(`rw: '${token}' not closed`);
        }
      }

      pattern.lastIndex = 0;
      match = pattern.exec(templateString);
    }
    return templateString;
  },

  it(template, data) {
    // On first run, call init plugins
    if (!this.initialized) {
      this.initialized = 1;
      [].slice.call(document.querySelectorAll('script[type=\'text/rw\']')).forEach((tmpl) => {
        this.templateCache[tmpl.id] = tmpl.innerHTML;
      });
    }

    let templateString = template;

    // No template tags found in template
    if (templateString.indexOf('{{') < 0) {
      // Is this a key for a cached template?
      const templateLookup = this.templateCache[templateString];
      if (templateLookup) {
        templateString = templateLookup;
      }
    }

    // // Substitute tokens in template
    if (templateString && data) {
      templateString = this.substitute(templateString, data);
    }

    return templateString;
  },
};
