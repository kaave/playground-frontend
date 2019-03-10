const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const conf = require('../config');
const { entry, output, resolve, rules, plugins, optimization } = require('./base');

const appendRules = [
  {
    test: /\.(j|t)sx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          babelrc: false,
          presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            '@babel/plugin-syntax-dynamic-import',
            'react-hot-loader/babel',
          ],
        },
      },
    ],
  },
  // { test: /\.js$/, use: 'source-map-loader', enforce: 'pre' },
];

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry,
  output,
  resolve: {
    ...resolve,
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
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
