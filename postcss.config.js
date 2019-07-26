const plugins = {
  /*
   * next features
   */
  // https://cssdb.org/#custom-properties
  'postcss-custom-properties': {},
  // https://cssdb.org/#hexadecimal-alpha-notation
  'postcss-color-hex-alpha': {},

  /*
   * modifiers
   */
  'postcss-calc': {},
  'postcss-flexbugs-fixes': {},
  'postcss-url': {},
  autoprefixer: { grid: true },
};

if (process.env.NODE_ENV === 'production') {
  // compressor
  plugins.cssnano = {};
}

module.exports = { plugins };
