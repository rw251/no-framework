const { FuseBox, QuantumPlugin, WebIndexPlugin, SassPlugin, CSSPlugin, CSSResourcePlugin, Sparky } = require('fuse-box');

let fuse;
let app;
let isProduction = false;
let isStaging = false;

Sparky.task('config', () => {
  fuse = FuseBox.init({
    homeDir: 'src',
    target: 'browser@es6',
    output: 'dist/$name.js',
    hash: isProduction,
    sourceMaps: !isProduction,
    useTypescriptCompiler: true,
    plugins: [
      WebIndexPlugin({ template: 'src/index.html' }),
      [SassPlugin(), CSSResourcePlugin({ dist: 'dist/css-resources' }), CSSPlugin()],
      (isProduction || isStaging) && QuantumPlugin({
        bakeApiIntoBundle: 'app',
        uglify: true,
        css: { clean: true },
      }),
    ],
  });

  app = fuse.bundle('app').instructions(' > index.js');

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
  return fuse.run();
});

// Dist task "node fuse dist"
Sparky.task('build', ['set-production', 'config'], () => fuse.run());

// Dist task "node fuse dist"
Sparky.task('dist', ['set-staging', 'config'], () => {
  app.hmr().watch();
  return fuse.run();
});
