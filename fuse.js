const { FuseBox, QuantumPlugin, WebIndexPlugin, SassPlugin, CSSPlugin, CSSResourcePlugin, Sparky } = require('fuse-box');
const fs = require('fs-extra');
const path = require('path');
const frames = require('./src/frames');

const mkDirByPathSync = (targetDir, { isRelativeToScript = false } = {}) => {
  const { sep } = path;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = isRelativeToScript ? __dirname : '.';
  let lastErr;

  return targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      if (err.code === 'EEXIST') { // Directory ${curDir} already exists!
        return curDir;
      }

      // The following lines of code to support Windows and Mac specific errors.
      if (err.code === 'ENOENT') { // Last dir fails with `EACCES` and current fails with `ENOENT`
        throw lastErr;
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
      if (!caughtErr || caughtErr && targetDir === curDir) {
        throw err; // Throw if it's only the last created dir.
      }

      lastErr = err;
    }

    return curDir;
  }, initDir);
};

const constructHtml = (css, js) => {
  const templates = fs.readFileSync('./src/html/templates/all.html', 'utf8');
  const headerAboveCss = fs.readFileSync('./src/html/partials/headerAboveCss.html', 'utf8');
  const headerBelowCss = fs.readFileSync('./src/html/partials/headerBelowCss.html', 'utf8');
  const bodyAboveContent = fs.readFileSync('./src/html/partials/bodyAboveContent.html', 'utf8');
  const bodyBelowContentAboveJs = fs.readFileSync('./src/html/partials/bodyBelowContentAboveJs.html', 'utf8');
  const bodyBelowJs = fs.readFileSync('./src/html/partials/bodyBelowJs.html', 'utf8');
  frames.forEach((frame) => {
    const content = fs.readFileSync(frame.html, 'utf8');
    const html = `
      ${headerAboveCss}
      ${css.map(c => `<link rel="stylesheet" type="text/css" href="/${c}">`).join('')}   
      ${headerBelowCss}
      ${bodyAboveContent}
      ${content}
      ${bodyBelowContentAboveJs}
      ${js.map(j => `<script type="text/javascript" src="/${j}"></script>`).join('')}      
      ${templates}
      ${bodyBelowJs}
    `;
    mkDirByPathSync(path.join('dist', frame.path), { isRelativeToScript: true });
    fs.writeFileSync(path.join('dist', frame.path, 'index.html'), html);
  });
};

let fuse;
let app;
let isProduction = false;
let isStaging = false;

Sparky.task('config', () => {
  fuse = FuseBox.init({
    homeDir: 'src',
    target: 'browser@es6',
    output: 'dist/$name-$hash.js',
    hash: isProduction,
    sourceMaps: !isProduction,
    useTypescriptCompiler: true,
    plugins: [
      // WebIndexPlugin({ template: 'src/index.html' }),
      [SassPlugin(), CSSPlugin()],
      (isProduction || isStaging) && QuantumPlugin({
        bakeApiIntoBundle: 'app',
        uglify: true,
        css: { clean: true },
      }),
    ],
  });

  app = fuse
    .bundle('app')
    .instructions(' > index.js');

  if (!isProduction) {
    fuse.dev();
  }
});

Sparky.task('set-production', () => {
  isProduction = true;
  return Sparky.src('dist/').clean('dist/');
});

Sparky.task('set-staging', () => {
  isStaging = true;
  return Sparky.src('dist/').clean('dist/');
});

// development task "node fuse""
Sparky.task('default', ['config'], () => {
  app.hmr().watch();
  return fuse.run().then(() => {
    // get tempaltes
    constructHtml([], ['app.js']);

    // console.log(producer.bundles.map(bundle => `<script type="text/javascript"
    // src="${bundle.context.output.lastPrimaryOutput.relativePath}"></script>`).join(''));
  });
});

// Dist task "node fuse dist"
Sparky.task('build', ['set-production', 'config'], () => {
  fuse.run().then((producer) => {
    const jsBundles = [];
    const injectedCss = [];
    producer.bundles.forEach((bundle) => {
      jsBundles.push(bundle.context.output.lastPrimaryOutput.relativePath);
    });
    producer.injectedCSSFiles.forEach((cssFile) => {
      injectedCss.push(cssFile);
    });
    constructHtml(injectedCss, jsBundles);
  });
});

// Dist task "node fuse dist"
Sparky.task('dist', ['set-staging', 'config'], () => {
  app.hmr().watch();
  return fuse.run().then((producer) => {
    const jsBundles = [];
    const injectedCss = [];
    producer.bundles.forEach((bundle) => {
      jsBundles.push(bundle.context.output.lastPrimaryOutput.relativePath);
    });
    producer.injectedCSSFiles.forEach((cssFile) => {
      injectedCss.push(cssFile);
    });
    constructHtml(injectedCss, jsBundles);
  });
});
