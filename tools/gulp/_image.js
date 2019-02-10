const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const webp = require('imagemin-webp');
const gif2webp = require('imagemin-gif2webp');
const extReplace = require('gulp-ext-replace');

const conf = require('../config');

const [srcJpgPng, srcGif] = conf.image.src;

gulp.task('image', () =>
  gulp
    .src(conf.image.src)
    .pipe(
      imagemin(
        [
          pngquant(conf.image.png),
          imagemin.optipng(),
          mozjpeg(conf.image.jpg),
          imagemin.svgo(conf.image.svg),
          imagemin.gifsicle(conf.image.gif),
        ],
        { verbose: true },
      ),
    )
    .pipe(gulp.dest(conf.path.dest.production)),
);

gulp.task('image:webp', () =>
  gulp
    .src(srcJpgPng)
    .pipe(imagemin([webp(conf.image.webp)], { verbose: true }))
    .pipe(extReplace('.webp'))
    .pipe(gulp.dest(conf.path.dest.production)),
);

gulp.task('image:gif2webp', () =>
  gulp
    .src(srcGif)
    .pipe(imagemin([gif2webp({ ...conf.image.webp, lossy: true })], { verbose: true }))
    .pipe(extReplace('.webp'))
    .pipe(gulp.dest(conf.path.dest.production)),
);
