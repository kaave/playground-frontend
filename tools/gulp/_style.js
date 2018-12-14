const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');

const browser = require('./browser');
const conf = require('../config');

gulp.task('style', () => gulp.src(conf.style.src)
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass(conf.style.sass).on('error', sass.logError))
  .pipe(postcss())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(`${conf.path.dest.development}/css`))
  .pipe(browser.reload({ stream: true }))
);

gulp.task('style:build', () => gulp.src(conf.style.src)
  .pipe(sass(conf.style.sass).on('error', sass.logError))
  .pipe(postcss())
  .pipe(gulp.dest(`${conf.path.dest.production}/css`))
);
