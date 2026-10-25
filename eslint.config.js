import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import lit from 'eslint-plugin-lit';
import litA11y from 'eslint-plugin-lit-a11y';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.astro/**',
      '**/.turbo/**',
      '**/src/generated/**',
      '**/custom-elements.json',
      'planning/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['packages/components/src/**/*.ts', 'packages/core/src/**/*.ts'],
    ...lit.configs['flat/recommended'],
  },
  {
    files: ['packages/components/src/**/*.ts', 'packages/core/src/**/*.ts'],
    ...litA11y.configs.recommended,
  },
  {
    files: ['tools/**/*.js', '**/*.config.{js,mjs,ts}', '**/scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  prettier,
);
