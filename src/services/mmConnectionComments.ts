// Функция получения заголовков и комментариев для стадий подключения MetaMask [★☆☆☆☆]

/**
 * mmConnectionComments - функция для получения заголовков и комментариев
 * к стадиям подключения MetaMask в зависимости от текущей фазы и состояния.
 * Использует локализацию и форматирование времени.
 * @module mmConnectionComments
 * @category Services
 * @example
 *   const { header, comment } = mmConnectionComments('checkIfMetaMaskInstalled', 'success');
 */

import i18n from '@/i18n';
import log from '@/log';

import { formatDateTime } from './formatDateTime';

// Константы фаз подключения
export const MMConnectionPhases = {
    CHECK_IF_INSTALLED: 'checkIfMetaMaskInstalled',
    CHECK_IF_UNLOCKED: 'checkIfMetaMaskUnlocked',
    CHECK_IF_CONNECTED_TO_BSC: 'checkIfMetaMaskConnectedToBSC',
    CHECK_OUT_ACCOUNT: 'checkOutMetaMaskAccount',
} as const;

export type MMConnectionPhase = typeof MMConnectionPhases[keyof typeof MMConnectionPhases];

// Константы состояний
export const MMConnectionStates = {
    WAITING: 'waiting',
    IN_PROGRESS: 'inprogress',
    SUCCESS: 'success',
    FAIL: 'fail',
} as const;

export type MMConnectionState = typeof MMConnectionStates[keyof typeof MMConnectionStates];

// Тип возвращаемого результата
export interface MMConnectionCommentResult {
    header: string;
    comment: string;
}

/**
 * Возвращает заголовок и комментарий для указанной фазы и состояния
 * @param {MMConnectionPhase} phase - текущая фаза подключения
 * @param {MMConnectionState} state - состояние в рамках фазы
 * @param {string | null} [formattedTime] - строка с датой/временем для подстановки в комментарий (опционально)
 * @returns {MMConnectionCommentResult} объект с полями header и comment
 */
export const mmConnectionComments = (
    phase: MMConnectionPhase,
    state: MMConnectionState,
    formattedTime?: string | null,
): MMConnectionCommentResult => {
    // Если передано время, используем его, иначе - текущее
    const formatedNow = formattedTime ?? formatDateTime();

    // Логируем входящие параметры
    log.debug(`mmConnectionComments: вызов с параметрами phase="${phase}", state="${state}", formattedTime="${formattedTime}"`);

    const phaseTranslations = i18n.t(`mmConnectionPhases.${phase}`, {
        returnObjects: true,
    }) as {
        header: string;
        states: Record<string, string>;
    };

    const header = phaseTranslations?.header ?? '-';
    let commentTemplate = phaseTranslations?.states?.[state] ?? '';

    // Заменяем {formatedNow}, если он есть
    const comment = commentTemplate.replace('{formatedNow}', formatedNow);

    return { header, comment };
};
