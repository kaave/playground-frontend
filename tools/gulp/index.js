const gulp = require('gulp');
const runSequence = require('run-sequence');

const conf = require('../config');

gulp.task(
  'default',
  gulp.series(
    'style',
    'view',
    gulp.parallel('server', () => {
      gulp.watch(conf.style.watch, gulp.task('style'));
      gulp.watch(conf.view.watch, gulp.task('view'));
    }),
  ),
);

gulp.task('build', gulp.series(
  gulp.parallel('style:build', 'view:build'),
  gulp.series(...Object.keys(conf.copy).map(key => `copy:${key}`), 'image'),
));
