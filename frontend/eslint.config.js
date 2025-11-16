import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { configs as tsConfigs } from '@typescript-eslint/eslint-plugin';
import { parser as tsParser } from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsParser,
    },
    extends: [
      js.configs.recommended,
      tsConfigs.recommended,
      tsConfigs['recommended-requiring-type-checking'],
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
  },
];
