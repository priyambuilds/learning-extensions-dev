// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-plugin-prettier/recommended';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import tailwindcss from 'eslint-plugin-tailwindcss';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { ignores: ['dist', 'node_modules', '*.config.js', '.wxt', 'public'] },

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      ...tailwindcss.configs['flat/recommended'],
      prettierConfig,
    ],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
      },
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'better-tailwindcss': betterTailwindcss,
    },
    settings: {
      react: { version: 'detect' },
      tailwindcss: {
        config: './tailwind.config.js',
        classRegex: '^class(Name)?$',
        callees: ['cn', 'cva', 'clsx'],
        removeDuplicates: true,
      },
      'better-tailwindcss': {
        tailwindConfig: './tailwind.config.js',
        callees: ['cn', 'cva', 'clsx'],
        classRegex: [
          { pattern: 'cn\\(([^)]*)\\)', group: 1 },
          { pattern: 'cva\\(([^)]*)\\)', group: 1 },
        ],
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',

      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-contradicting-classname': 'error',
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/enforces-shorthand': 'warn',

      'better-tailwindcss/sort-classes': 'warn',
      'better-tailwindcss/no-duplicate-classes': 'error',
      'better-tailwindcss/multiline': ['warn', { printWidth: 100 }],

      'no-console': 'warn',
      'prefer-const': 'warn',

      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          printWidth: 100,
          tabWidth: 2,
          semi: true,
          trailingComma: 'es5',
          arrowParens: 'avoid',
        },
      ],
    },
  },

  {
    files: ['entrypoints/**/*', '*.config.*'],
    rules: {
      'no-console': 'off',
      'react-refresh/only-export-components': 'off',
      'tailwindcss/classnames-order': 'off',
      'better-tailwindcss/sort-classes': 'off',
    },
  },
]);
