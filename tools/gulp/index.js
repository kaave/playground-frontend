const gulp = require('gulp');
const runSequence = require('run-sequence');

const conf = require('../config');

gulp.task('dev', cb => runSequence(['style', 'view'], 'server', cb));

gulp.task('default', ['dev'], () => {
  gulp.watch(conf.style.watch, ['style']);
  gulp.watch(conf.view.watch, ['view']);
});

gulp.task('build', cb => runSequence(
  ['style:build', 'view:build'],
  [...Object.keys(conf.copy).map(key => `copy:${key}`), 'image'],
  cb
));
