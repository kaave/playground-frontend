const gulp = require('gulp');
const plumber = require('gulp-plumber');
const ejs = require('gulp-ejs');
const htmlmin = require('gulp-htmlmin');

const browser = require('./browser');
const conf = require('../config');
const siteConfig = require('../../src/site-config.json');

const params = { ...siteConfig, NODE_ENV: process.env.NODE_ENV };

gulp.task('view', () => gulp.src(conf.view.src)
  .pipe(plumber())
  .pipe(ejs(params, {}, { ext: '.html' }))
  .pipe(gulp.dest(conf.path.dest.development))
  .pipe(browser.reload({ stream: true }))
);

gulp.task('view:build', () => gulp.src(conf.view.src)
  .pipe(ejs(params, {}, { ext: '.html' }))
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest(conf.path.dest.production))
);
