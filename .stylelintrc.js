module.exports = {
  extends: ['stylelint-config-recommended-scss'],
  ignoreFiles: ['node_modules/**/*', '_template/**/*', '.tmp/**/*', 'assets/**/*', 'build/**/*', 'src/assets/**/*'],
  syntax: 'scss',
  plugins: ['stylelint-scss'],
  rules: {
    /*
     * prettier
     */
    'max-line-length': null,
    indentation: null,
    'no-extra-semicolons': null,
    'declaration-block-semicolon-newline-after': null,
    'declaration-block-semicolon-newline-before': null,
    'declaration-block-semicolon-space-after': null,
    'declaration-block-semicolon-space-before': null,
    'string-quotes': null,
    'block-closing-brace-empty-line-before': null,
    'block-closing-brace-newline-after': null,
    'block-closing-brace-newline-before': null,
    'block-closing-brace-space-after': null,
    'block-closing-brace-space-before': null,
    'block-opening-brace-newline-after': null,
    'block-opening-brace-newline-before': null,
    'block-opening-brace-space-after': null,
    'block-opening-brace-space-before': null,
    'number-leading-zero': null,
    'number-no-trailing-zeros': null,

    /*
     * Manual
     */
    // extend無効化
    'at-rule-blacklist': ['extend'],
    // コメント記号とコメント本文の間にスペースを共用する 無効化 IntelliJと相性が悪い
    'comment-whitespace-inside': null,
    // @の前に空行を強制 いくつかのルールは例外
    'at-rule-empty-line-before': [
      'always',
      {
        except: ['blockless-after-same-name-blockless', 'first-nested', 'inside-block'],
        ignore: ['after-comment'],
      },
    ],
    // 複雑すぎる指定はNG ただし属性っぽいものはだいたいOK
    'selector-max-specificity': ['0,2,0', { ignoreSelectors: ['/:.*/', '/-[^-].*/', '/ \\+ /'] }],
    // カンマの後ろにはスペース
    'function-comma-space-after': 'always-single-line',
  },
};
