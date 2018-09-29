const webpack = require('webpack');

const conf = require('../config');
const { entry, output, resolve, rules, plugins, optimization } = require('./base');

const appendRules = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    loader: [
      'awesome-typescript-loader',
    ],
  },
  { test: /\.js$/, use: 'source-map-loader', enforce: 'pre' },
];

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: Object.entries(entry).reduce(
    (tmp, [key, value]) => {
      tmp[key] = [
        `webpack-dev-server/client?http://localhost:${conf.port.webpackDevServer}`,
        'webpack/hot/only-dev-server',
        ...(value instanceof Array ? value : [value]),
      ];
      return tmp;
    },
    {},
  ),
  output,
  resolve,
  optimization,
  plugins: [
    ...plugins,
    new webpack.NamedModulesPlugin(),
  ],
  module: {
    rules: [...rules, ...appendRules],
  },
  devServer: {
    publicPath: output.publicPath,
    contentBase: [conf.path.dest.development, conf.path.assets],
    port: conf.port.webpackDevServer,
  },
};
