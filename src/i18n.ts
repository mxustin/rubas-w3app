// Импорт и настройка механизма локализации

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationRU from './locales/ru/translation.json';
import translationEN from './locales/en/translation.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ru: {
                translation: translationRU,
            },
            en: {
                translation: translationEN,
            },
        },
        lng: 'ru', // или 'en' по умолчанию
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // React уже экранирует
        },
    });

export default i18n;