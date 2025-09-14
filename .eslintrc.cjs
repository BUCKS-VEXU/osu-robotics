module.exports = {
  root: true,
  env: {node: true, es2020: true},
  extends:
  [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-refresh/recommended',
    'prettier'
  ],
  ignorePatterns: [ 'dist', '.eslintrc.cjs' ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components' :
    [
      'warn',
      {allowConstantExport: true},
    ],
  },
  settings:
  {
    react: { version: 'detect' }
  }
}
