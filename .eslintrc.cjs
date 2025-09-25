module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-refresh/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  ignorePatterns: ['dist', 'node_modules'],
  settings: { react: { version: 'detect' } },

  // Global defaults (client)
  env: { browser: true, es2021: true },

  overrides: [
    // Server files
    {
      files: ['src/server/**/*.{ts,tsx}'],
      env: { node: true, browser: false },
    },
  ],

  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
