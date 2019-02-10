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

const buildTasks = [
  gulp.parallel('style:build', 'view:build'),
  gulp.series(...Object.keys(conf.copy).map(key => `copy:${key}`), 'image'),
];
if (conf.image.createWebp) {
  buildTasks.push('image:webp');
  buildTasks.push('image:gif2webp');
}
gulp.task('build', gulp.series(...buildTasks));
