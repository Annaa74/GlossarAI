// Flat ESLint config (ESLint v9+).
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    // Pin React version explicitly — auto-detection breaks under ESLint 10.
    settings: { react: { version: '19.1.0' } },
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      // The codebase casts a few icon names to `any` intentionally.
      '@typescript-eslint/no-explicit-any': 'off',
      // Plain apostrophes in JSX text are fine; the rule is more noise than safety.
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'web-build/**',
      'android/**',
      'ios/**',
      'coverage/**',
      'expo-env.d.ts',
    ],
  },
];
