// Конфигурация ESLint для проекта с TypeScript и React

/**
 * @file Настройка ESLint для обеспечения качества кода
 * @module
 * @description Конфигурация включает:
 * - Базовые правила ESLint
 * - Поддержку TypeScript
 * - Правила React Hooks и React Refresh
 * - Настройки окружения (ES2020, браузерные глобалы)
 * @see {@link https://eslint.org/ ESLint}
 * @see {@link https://typescript-eslint.io/ TypeScript ESLint}
 * @example
 * export default tseslint.config(...)
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
