import 'antd/dist/reset.css';
import '@/index.css';
import React from 'react';
import i18n from '@/i18n';

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

const LocaleEffect = ({ locale }: { locale: string }) => {
    React.useEffect(() => {
        i18n.changeLanguage(locale);
    }, [locale]);
    return null;
};

export const decorators = [
    (Story, context) => (
        <>
            <LocaleEffect locale={context.globals.locale} />
            <Story />
        </>
    ),
];

export default {
    parameters: {
        docs: {
            page: undefined, // Важно! Используем autodocs
        },
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)/i,
            },
        },
    },
};