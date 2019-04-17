module.exports = {
  extends: ['stylelint-config-recommended-scss', 'stylelint-config-prettier'],
  ignoreFiles: ['node_modules/**/*', '_template/**/*', '.tmp/**/*', 'assets/**/*', 'build/**/*', 'src/assets/**/*'],
  syntax: 'scss',
  rules: {
    /*
     * Manual
     */
    // extend無効化
    'at-rule-blacklist': ['extend'],
    // コメント記号とコメント本文の間にスペースを共用する 無効化 IntelliJと相性が悪い
    'comment-whitespace-inside': null,
    // @の前に空行を強制 無効化 ややこしい
    'at-rule-empty-line-before': null,
    // 複雑すぎる指定はNG ただし属性っぽいものはだいたいOK
    'selector-max-specificity': ['0,2,0', { ignoreSelectors: ['/:.*/', '/-[^-].*/', '/ \\+ /'] }],
    // カンマの後ろにはスペース
    'function-comma-space-after': 'always-single-line',
  },
};
