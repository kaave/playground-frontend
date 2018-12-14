const gulp = require('gulp');

const browser = require('./browser');
const conf = require('../config');

gulp.task('server', () => browser.init(null, conf.browser));

