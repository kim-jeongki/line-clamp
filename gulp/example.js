import babelify from 'babelify';
import browserify from 'browserify';
import del from 'del';
import ecstatic from 'ecstatic';
import gulp from 'gulp';
import gutil from 'gulp-util';
import http from 'http';
import nopt from 'nopt';
import opn from 'opn';
import runSequence from 'run-sequence';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import watchify from 'watchify';

gulp.task('example', (callback) => {
  runSequence(
    'example:clean',
    'example:watch',
    'example:serve',
    callback
  );
});

gulp.task('example:clean', () => {
  return del('./example/bundle.js');
});

gulp.task('example:watch', () => {
  const b = watchify(browserify({
    entries: './example/index.js',
    basedir: '.'
  }));
  b.transform(babelify);
  const bundle = () => {
    return b.bundle()
      .on('error', ({message, codeFrame}) => {
        gutil.log(gutil.colors.red(message));
        console.log(codeFrame);
      })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(gulp.dest('./example'));
  };
  b.on('update', bundle);
  b.on('log', gutil.log);
  bundle();
});

gulp.task('example:serve', () => {
  http.createServer(ecstatic({
    root: './example'
  })).listen(4242);
  const args = nopt({
    open: Boolean
  }, {
    o: ['--open']
  });
  if (args.open) {
    const url = 'http://localhost:4242';
    gutil.log(gutil.colors.green('Opening', url));
    opn(url, {
      app: 'google chrome',
      wait: false
    });
  }
});
