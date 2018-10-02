const path = require('path');
const webpack = require('webpack');
const globby = require('globby');

const conf = require('../config');

exports.entry = globby.sync([path.join(conf.path.scripts, '*.ts')])
  .reduce((tmp, filepath) => {
    tmp[path.basename(filepath, path.extname(filepath))] = filepath;
    return tmp;
  },
  {},
);

exports.output = {
  path: conf.path.dest.production,
  filename: 'js/[name].js',
  publicPath: '/',
};

exports.resolve = {
  modules: ['node_modules'],
  extensions: ['json', '.tsx', '.ts', '.css', '.js'],
};

exports.rules = [
  {
    test: /\.scss$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
        },
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
        },
      },
    ],
  },
  {
    test: /\.(txt|md|frag|vert|glsl)$/,
    use: 'raw-loader',
  },
];

exports.plugins = [
  new webpack.DefinePlugin({
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
  }),
];

exports.optimization = {
  splitChunks: {
    name: 'vendor.bundle',
    chunks: 'initial',
  }
};
