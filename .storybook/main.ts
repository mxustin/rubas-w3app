// Главный файл настроек Storybook для TypeScript [★★★☆☆]

import type { StorybookConfig } from '@storybook/react-vite';
import * as path from 'path';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
    stories: [
        '../src/**/*.stories.@(ts|tsx|js|jsx)'
    ],
    addons: [
        '@storybook/addon-essentials',
        '@storybook/experimental-addon-test'
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    async viteFinal(config) {
        return mergeConfig(config, {
            resolve: {
                alias: {
                    '@': path.resolve(__dirname, '../src'),
                }
            }
        });
    },
    typescript: {
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            shouldExtractLiteralValuesFromEnum: true,
            shouldRemoveUndefinedFromOptional: true,
        },
    },
};

// noinspection JSUnusedGlobalSymbols [причина: экспорт используется неявно]
export default config;
