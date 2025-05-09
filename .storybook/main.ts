import { mergeConfig } from 'vite';
import path from 'path';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|js|jsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/experimental-addon-test' // Правильное подключение аддона
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, { // Убираем withTest
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          // Добавьте другие алиасы если нужно
        }
      }
    });
  },
  features: {
    storyStoreV7: true,
    buildStoriesJson: true,
  },
  docs: {
    autodocs: true,
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
    },
  },
};


export default config;
