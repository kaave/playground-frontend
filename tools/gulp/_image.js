const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');

const conf = require('../config');

gulp.task('image', () => gulp.src(conf.image.src)
  .pipe(imagemin([
    pngquant(conf.image.png),
    imagemin.optipng(),
    mozjpeg(conf.image.jpg),
    imagemin.svgo(conf.image.svg),
    imagemin.gifsicle(conf.image.gif),
  ], { verbose: true }))
  .pipe(gulp.dest(conf.path.dest.production))
);
