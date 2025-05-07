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

import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default tseslint.config(
    {
        ignores: ['dist'],
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser, // ✅ обязательно указать парсер
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 2020,
            },
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'simple-import-sort': simpleImportSort,
            'import': importPlugin,
        },
        rules: {
// React
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

            // Сортировка импортов
            'simple-import-sort/imports': 'warn',
            'simple-import-sort/exports': 'warn',

            // Валидация импортов
            'import/first': 'error',
            'import/newline-after-import': 'warn',
            'import/no-duplicates': 'warn',
        },
    },
);