// Функция представления даты и времени в кратком формате

import log from '@/log';
import i18n from '@/i18n';

/**
 * Форматирует дату и время в строку формата:
 * ru: d mmm hh:mm:ss (например, 9 мая 20:43:23)
 * en: mmm d hh:mm:ss (например, May 9 20:43:23)
 * @param {Date} [date] - Необязательная дата (если не указана, используется текущая)
 * @returns {string} Строка с отформатированной датой и временем, локализованная
 * @example
   formatDateTime(new Date('2024-05-09T20:43:23')) // "9 мая 20:43:23" или "May 9 20:43:23"
 */

export const formatDateTime = (date?: Date): string => {
    const currentLocale = i18n.language || 'en';
    let targetDate: Date;

    if (date) {
        log.debug(`Функция форматирования даты и времени. Получен аргумент: ${date.toString()}.`);
        targetDate = date;
    } else {
        targetDate = new Date();
        log.debug(`Функция форматирования даты и времени. Аргумент не получен. 
          Текущее время: ${targetDate.toString()}.`);
    }

    const day = targetDate.getDate();
    const hours = targetDate.getHours().toString().padStart(2, '0');
    const minutes = targetDate.getMinutes().toString().padStart(2, '0');
    const seconds = targetDate.getSeconds().toString().padStart(2, '0');
    const monthIndex = targetDate.getMonth(); // 0–11

    const monthMap: Record<string, string[]> = {
        ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    };

    const month = monthMap[currentLocale]?.[monthIndex] ?? monthMap['en'][monthIndex];

    // Формируем строку в зависимости от локали
    const formattedString =
        currentLocale === 'ru'
            ? `${day} ${month} ${hours}:${minutes}:${seconds}`: `${month} ${day} ${hours}:${minutes}:${seconds}`;

    log.debug(`Функция форматирования даты и времени. Отформатированная строка: "${formattedString}" 
      (текущая локаль: ${currentLocale}).`);

    return formattedString;
};