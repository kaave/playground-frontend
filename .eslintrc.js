module.exports = {
  extends: [
    'airbnb-base',
    // 'airbnb',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/parser/README.md
    ecmaFeatures: {
      jsx: true,
    },
    // sourceType: 'module',
    project: './tsconfig.json',
    extraFileExtensions: ['.vue'],
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    // importタグの拡張子がらみTS対応
    'import/resolver': {
      // use <root>/tsconfig.json
      typescript: {},
    },
  },
  rules: {
    // default exportを押す 無効化
    'import/prefer-default-export': 'off',

    /*
     * typescript
     */
    // publicとかprivateなどのアクセス修飾子を強要 無効化 JSに寄せたいし、そもそもなるべくなくてもいいように書きたい
    '@typescript-eslint/explicit-member-accessibility': 'off',
    // 関数のexportの並び順をしばる 有効化
    '@typescript-eslint/adjacent-overload-signatures': 'error',
  },
};
