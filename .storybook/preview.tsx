// Настройки отображения для Storybook (настройки тулбара: добавление кнопки переключения локализаций) [★★★☆☆]

import 'antd/dist/reset.css';
import '@/index.css';

import type { Decorator, StoryContext, StoryFn } from '@storybook/react';
import * as React from 'react';

import i18n from '@/i18n';

// noinspection JSUnusedGlobalSymbols
export const globalTypes = {
    locale: {
        name: 'Locale',
        description: 'Internationalization locale',
        defaultValue: 'ru',
        toolbar: {
            icon: 'globe',
            items: [
                { value: 'ru', right: '🇷🇺', title: 'Русский' },
                { value: 'en', right: '🇬🇧', title: 'English' },
            ],
            showName: true,
        },
    },
};

/* eslint-disable react-refresh/only-export-components */
const LocaleEffect = ({ locale }: { locale: string }) => {
    React.useEffect(() => {
        i18n.changeLanguage(locale).catch((err) => {
            console.error('Ошибка при попытке смены языка:', err);
        });
    }, [locale]);
    return null;
};

// noinspection JSUnusedGlobalSymbols
export const decorators: Decorator[] = [
    (Story: StoryFn<React.ReactNode>, context: StoryContext) => (
        <>
            <LocaleEffect locale={context.globals.locale} />
            <Story />
        </>
    ),
];

// noinspection JSUnusedGlobalSymbols
export default {
    parameters: {
        docs: {
            page: undefined,
        },
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)/i,
            },
        },
    },
};
