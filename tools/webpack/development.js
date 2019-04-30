const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const hash = require('hash-sum');

const conf = require('../config');
const { entry, output, resolve, rules, plugins, optimization } = require('./base');

const cacheIdentifier = hash([
  require('typescript/package.json').version,
  require('ts-loader/package.json').version,
  require('cache-loader/package.json').version,
  fs.readFileSync(path.join(process.cwd(), 'tsconfig.json'), 'utf-8'),
  fs.readFileSync(path.join(__dirname, 'base.js'), 'utf-8'),
  fs.readFileSync(path.join(__dirname, 'development.js'), 'utf-8'),
  process.env.NODE_ENV,
]);

const appendRules = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'cache-loader',
        options: {
          cacheDirectory: path.join(process.cwd(), 'node_modules', '.cache', 'ts-loader'),
          cacheIdentifier,
        },
      },
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  { test: /\.js$/, use: 'source-map-loader', enforce: 'pre' },
];

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: Object.entries(entry).reduce((tmp, [key, value]) => {
    tmp[key] = [
      `webpack-dev-server/client?http://localhost:${conf.port.webpackDevServer}`,
      'webpack/hot/only-dev-server',
      ...(value instanceof Array ? value : [value]),
    ];
    return tmp;
  }, {}),
  output,
  resolve,
  optimization,
  plugins: [...plugins, new webpack.NamedModulesPlugin(), new ForkTsCheckerWebpackPlugin()],
  module: {
    rules: [...rules, ...appendRules],
  },
  devServer: {
    publicPath: output.publicPath,
    contentBase: [conf.path.assets, conf.path.dest.development, conf.path.template],
    port: conf.port.webpackDevServer,
  },
};
