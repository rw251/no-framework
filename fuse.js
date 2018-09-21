const { FuseBox, QuantumPlugin, SassPlugin, CSSPlugin, Sparky } = require('fuse-box'); // eslint-disable-line import/no-extraneous-dependencies
const fs = require('fs');
const path = require('path');

const constructHtml = (css, js) => {
  const templates = [];
  fs.readdirSync('./src/html/templates').forEach((file) => {
    const template = fs.readFileSync(path.join('./src/html/templates', file), 'utf8');
    templates.push(`<script type='text/rw' id='${file.split('.')[0]}'>${template}</script>`);
  });
  const headerAboveCss = fs.readFileSync('./src/html/partials/headerAboveCss.html', 'utf8');
  const belowCssAboveJs = fs.readFileSync('./src/html/partials/belowCssAboveJs.html', 'utf8');
  const belowJs = fs.readFileSync('./src/html/partials/belowJs.html', 'utf8');

  const html = `
    ${headerAboveCss}
    ${css.map(c => `<link rel="stylesheet" type="text/css" href="/${c}">`).join('')}   
    ${belowCssAboveJs}
    ${js.map(j => `<script type="text/javascript" src="/${j}"></script>`).join('')}  
    ${templates.join('')}     
    ${belowJs}
  `;

  fs.writeFileSync(path.join('dist', 'index.html'), html);
};

let fuse;
let app;
let isProduction = false;
let isStaging = false;

Sparky.task('config', () => {
  fuse = FuseBox.init({
    homeDir: 'src',
    target: 'browser@es5',
    output: 'dist/$name-$hash.js',
    hash: isProduction,
    sourceMaps: !isProduction,
    useTypescriptCompiler: true,
    plugins: [
      [SassPlugin({ importer: true }), CSSPlugin()],
      (isProduction || isStaging) && QuantumPlugin({
        bakeApiIntoBundle: 'app',
        uglify: true,
        css: { clean: true },
      }),
    ],
  });

  app = fuse
    .bundle('app')
    .instructions(' > index.js')
    .completed(() => {
      Sparky.context.css = [];
      Sparky.context.js = ['app.js'];
      Sparky.exec('construct-html');
    });

  if (!isProduction) {
    fuse.dev({ fallback: 'index.html' }); // fallback ensures all 404s get the index.html
  }
});

Sparky.task('construct-html', () => {
  constructHtml(Sparky.context.css, Sparky.context.js);
});

Sparky.task('clean', () => Sparky.src('dist/').clean('dist/'));

Sparky.task('copy-assets', () => Sparky.src('**/**.*', { base: './src/assets' }).dest('./dist'));

Sparky.task('set-production', () => {
  isProduction = true;
});

Sparky.task('set-staging', () => {
  isStaging = true;
});

// development task "node fuse""
Sparky.task('default', ['clean', 'copy-assets', 'config'], () => {
  app.hmr({ reload: true }).watch();
  return fuse.run().then(() => {
    Sparky.exec('construct-html');
  });
});

// Dist task "node fuse dist"
Sparky.task('build', ['clean', 'copy-assets', 'set-production', 'config'], () => {
  fuse.run().then((producer) => {
    const jsBundles = [];
    const injectedCss = [];
    producer.bundles.forEach((bundle) => {
      jsBundles.push(bundle.context.output.lastPrimaryOutput.relativePath);
    });
    producer.injectedCSSFiles.forEach((cssFile) => {
      injectedCss.push(cssFile);
    });
    Sparky.context.css = injectedCss;
    Sparky.context.js = jsBundles;
    Sparky.exec('construct-html');
  });
});

// Dist task "node fuse dist"
Sparky.task('dist', ['clean', 'copy-assets', 'set-staging', 'config'], () => {
  app.hmr({ reload: true }).watch();
  fuse.run().then((producer) => {
    const jsBundles = [];
    const injectedCss = [];
    producer.bundles.forEach((bundle) => {
      jsBundles.push(bundle.context.output.lastPrimaryOutput.relativePath);
    });
    producer.injectedCSSFiles.forEach((cssFile) => {
      injectedCss.push(cssFile);
    });
    Sparky.context.css = injectedCss;
    Sparky.context.js = jsBundles;
    Sparky.exec('construct-html');
  });
});
