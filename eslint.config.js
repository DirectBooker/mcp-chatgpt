import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Base JavaScript recommended rules
  js.configs.recommended,
  
  // TypeScript files configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs.strict.rules,
      
      // Prettier integration
      'prettier/prettier': 'error',
      
      // Unused variables with underscore exemption
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      
      // Core strict type safety rules
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      
      // General code quality rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      
      // Disable conflicting rules that are handled by TypeScript
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  
  // Prettier config to disable conflicting rules
  prettierConfig,
  
  // Global ignores
  {
    ignores: ['dist/', 'node_modules/', '*.js', '!eslint.config.js'],
  },
];
