// Хранилище подключения к MetaMask (zustand + persist) [★★★★☆]

/**
 * Модуль управления состоянием подключения через Zustand с сохранением в localStorage.
 * Реализует конечный автомат для поэтапного подключения к MetaMask.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CONNECTION_RESET_TIMEOUT_MINUTES } from '@/constants/connection';
import log from '@/log';

// ======================== Константы и типы ========================

/**
 * Фазы процесса подключения:
 * 1. Проверка установки MetaMask
 * 2. Проверка разблокировки кошелька
 * 3. Проверка подключения к сети BSC
 * 4. Получение данных аккаунта
 */
export const ConnectionPhases = {
    CHECK_IF_INSTALLED: 'checkIfMetaMaskInstalled',
    CHECK_IF_UNLOCKED: 'checkIfMetaMaskUnlocked',
    CHECK_IF_CONNECTED_TO_BSC: 'checkIfMetaMaskConnectedToBSC',
    CHECK_OUT_ACCOUNT: 'checkOutMetaMaskAccount',
} as const;

export type ConnectionPhase = typeof ConnectionPhases[keyof typeof ConnectionPhases];

/**
 * Возможные статусы для каждой фазы:
 * - waiting: Ожидание начала выполнения
 * - inprogress: Фаза выполняется
 * - success: Успешное завершение
 * - fail: Ошибка выполнения
 * - cancelled: Отмена выполнения
 */
export const PhaseStatuses = {
    WAITING: 'waiting',
    IN_PROGRESS: 'inprogress',
    SUCCESS: 'success',
    FAIL: 'fail',
    CANCELLED: 'cancelled',
} as const;

export type PhaseStatus = typeof PhaseStatuses[keyof typeof PhaseStatuses];

// ======================== Интерфейсы состояния ========================

/** Информация о текущей фазе подключения */
export interface PhaseInfo {
    phase: ConnectionPhase;
    status: PhaseStatus;
    timestamp: number | null;
}

/**
 * Состояние хранилища подключения:
 * - firstTimeConnection: Флаг первого подключения
 * - lastSuccessfulConnection: Время последнего успешного подключения
 * - currentPhase: Текущая активная фаза
 * - phaseStatuses: Статусы всех фаз
 * - phaseTimestamps: Временные метки изменения статусов
 */
export interface ConnectionStoreState {
    firstTimeConnection: boolean;
    lastSuccessfulConnection: number | null;
    currentPhase: ConnectionPhase;
    phaseStatuses: Record<ConnectionPhase, PhaseStatus>;
    phaseTimestamps: Record<ConnectionPhase, number | null>;

    // Методы управления состоянием
    firstStart: () => void;      // Начало нового подключения
    reStart: () => void;         // Перезапуск текущего подключения
    goOn: () => void;            // Успешное завершение текущей фазы
    goFail: () => void;          // Ошибка выполнения текущей фазы
    cancel: () => void;          // Отмена подключения
    setPhaseStatus: (phase: ConnectionPhase, status: PhaseStatus) => void; // Ручное изменение статуса
    resetStatuses: () => void;   // Сброс всех статусов
    fullReset: () => void;       // Полный сброс состояния (включая persistent)
    getPhaseInfo: () => PhaseInfo; // Получение информации о текущей фазе
}

// ======================== Инициализационные константы ========================

/** Порядок выполнения фаз подключения */
const phaseOrder: ConnectionPhase[] = [
    ConnectionPhases.CHECK_IF_INSTALLED,
    ConnectionPhases.CHECK_IF_UNLOCKED,
    ConnectionPhases.CHECK_IF_CONNECTED_TO_BSC,
    ConnectionPhases.CHECK_OUT_ACCOUNT,
];

/** Начальные статусы для всех фаз */
const initialStatuses: Record<ConnectionPhase, PhaseStatus> = {
    [ConnectionPhases.CHECK_IF_INSTALLED]: PhaseStatuses.WAITING,
    [ConnectionPhases.CHECK_IF_UNLOCKED]: PhaseStatuses.WAITING,
    [ConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: PhaseStatuses.WAITING,
    [ConnectionPhases.CHECK_OUT_ACCOUNT]: PhaseStatuses.WAITING,
};

/** Начальные временные метки для фаз */
const initialTimestamps: Record<ConnectionPhase, number | null> = {
    [ConnectionPhases.CHECK_IF_INSTALLED]: null,
    [ConnectionPhases.CHECK_IF_UNLOCKED]: null,
    [ConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: null,
    [ConnectionPhases.CHECK_OUT_ACCOUNT]: null,
};

// ======================== Реализация хранилища ========================

export const useConnectionStore = create<ConnectionStoreState>()(
    persist(
        (set, get) => {
            // Инициализация состояния с проверкой существующих значений
            const initialState = get() ?? {
                firstTimeConnection: true,
                lastSuccessfulConnection: null,
                currentPhase: ConnectionPhases.CHECK_IF_INSTALLED,
                phaseStatuses: { ...initialStatuses },
                phaseTimestamps: { ...initialTimestamps }
            };

            // Проверка необходимости сброса по таймауту
            const now = Date.now();
            const last = initialState.lastSuccessfulConnection;
            const diffMinutes = last ? (now - last) / 1000 / 60 : Infinity;
            const shouldReset = diffMinutes > CONNECTION_RESET_TIMEOUT_MINUTES;

            return {
                ...initialState,
                firstTimeConnection: shouldReset,

                /** Начало нового подключения */
                firstStart: () => {
                    log.debug('[Store] Инициализация нового подключения');
                    set((state) => ({
                        currentPhase: ConnectionPhases.CHECK_IF_INSTALLED,
                        phaseStatuses: {
                            ...state.phaseStatuses,
                            [ConnectionPhases.CHECK_IF_INSTALLED]: PhaseStatuses.IN_PROGRESS,
                        },
                        phaseTimestamps: {
                            ...state.phaseTimestamps,
                            [ConnectionPhases.CHECK_IF_INSTALLED]: Date.now(), // Фиксация времени начала
                        },
                        firstTimeConnection: false,
                    }));
                },

                /** Перезапуск подключения */
                reStart: () => {
                    log.debug('[Store] Перезапуск текущего подключения');
                    set((state) => ({
                        currentPhase: ConnectionPhases.CHECK_IF_INSTALLED,
                        phaseStatuses: {
                            ...state.phaseStatuses,
                            [ConnectionPhases.CHECK_IF_INSTALLED]: PhaseStatuses.IN_PROGRESS,
                        },
                        phaseTimestamps: {
                            ...state.phaseTimestamps,
                            [ConnectionPhases.CHECK_IF_INSTALLED]: Date.now(),
                        },
                    }));
                },

                /** Успешное завершение текущей фазы */
                goOn: () => {
                    const { currentPhase, phaseStatuses, phaseTimestamps } = get();
                    const currentIndex = phaseOrder.indexOf(currentPhase);
                    const isLast = currentIndex === phaseOrder.length - 1;
                    const nextPhase = isLast ? null : phaseOrder[currentIndex + 1];

                    log.debug(`[Store] Завершение фазы ${currentPhase} → ${nextPhase}`);

                    // Обновление статуса текущей фазы
                    const updatedStatuses = {
                        ...phaseStatuses,
                        [currentPhase]: PhaseStatuses.SUCCESS,
                    };

                    // Обновление временной метки
                    const updatedTimestamps = {
                        ...phaseTimestamps,
                        [currentPhase]: Date.now(), // Фиксация времени успешного завершения
                    };

                    // Инициализация следующей фазы
                    if (nextPhase) {
                        updatedStatuses[nextPhase] = PhaseStatuses.IN_PROGRESS;
                        updatedTimestamps[nextPhase] = Date.now();
                    }

                    set({
                        currentPhase: nextPhase ?? currentPhase,
                        phaseStatuses: updatedStatuses,
                        phaseTimestamps: updatedTimestamps,
                        lastSuccessfulConnection: isLast ? Date.now() : get().lastSuccessfulConnection,
                    });
                },

                /** Обработка ошибки фазы */
                goFail: () => {
                    const { currentPhase, phaseStatuses, phaseTimestamps } = get();
                    log.debug(`[Store] Ошибка на фазе ${currentPhase}`);
                    set({
                        phaseStatuses: {
                            ...phaseStatuses,
                            [currentPhase]: PhaseStatuses.FAIL,
                        },
                        phaseTimestamps: {
                            ...phaseTimestamps,
                            [currentPhase]: Date.now(), // Фиксация времени ошибки
                        },
                    });
                },

                /** Отмена подключения */
                cancel: () => {
                    const { currentPhase, phaseStatuses, phaseTimestamps } = get();
                    log.debug(`[Store] Отмена на фазе ${currentPhase}`);
                    set({
                        phaseStatuses: {
                            ...phaseStatuses,
                            [currentPhase]: PhaseStatuses.CANCELLED,
                        },
                        phaseTimestamps: {
                            ...phaseTimestamps,
                            [currentPhase]: Date.now(), // Фиксация времени отмены
                        },
                    });
                },

                /** Ручное изменение статуса фазы */
                setPhaseStatus: (phase, status) => {
                    const { phaseStatuses, phaseTimestamps } = get();
                    log.debug(`[Store] Ручное изменение статуса ${phase} → ${status}`);

                    // Обновление метки времени только для не-waiting статусов
                    const newTimestamp = status !== PhaseStatuses.WAITING
                        ? Date.now()
                        : phaseTimestamps[phase];

                    set({
                        phaseStatuses: {
                            ...phaseStatuses,
                            [phase]: status,
                        },
                        phaseTimestamps: {
                            ...phaseTimestamps,
                            [phase]: newTimestamp,
                        },
                    });
                },

                /** Сброс всех статусов */
                resetStatuses: () => {
                    log.debug('[Store] Сброс всех статусов');
                    set({
                        currentPhase: ConnectionPhases.CHECK_IF_INSTALLED,
                        phaseStatuses: { ...initialStatuses },
                        phaseTimestamps: { ...initialTimestamps },
                    });
                },

                /** Полный сброс состояния */
                fullReset: () => {
                    log.debug('[Store] Полный сброс состояния');
                    set({
                        firstTimeConnection: true,
                        lastSuccessfulConnection: null,
                        currentPhase: ConnectionPhases.CHECK_IF_INSTALLED,
                        phaseStatuses: { ...initialStatuses },
                        phaseTimestamps: { ...initialTimestamps },
                    });
                },

                /** Получение информации о текущей фазе */
                getPhaseInfo: () => {
                    const { currentPhase, phaseStatuses, phaseTimestamps } = get();
                    return {
                        phase: currentPhase,
                        status: phaseStatuses[currentPhase],
                        timestamp: phaseTimestamps[currentPhase],
                    };
                },
            };
        },
        {
            name: 'connection-storage',
            partialize: (state) => ({
                firstTimeConnection: state.firstTimeConnection,
                lastSuccessfulConnection: state.lastSuccessfulConnection,
            }),
            migrate: (persistedState: any) => ({
                ...persistedState,
                lastSuccessfulConnection: persistedState.lastSuccessfulConnection ?? null,
                phaseStatuses: persistedState.phaseStatuses ?? initialStatuses,
                phaseTimestamps: persistedState.phaseTimestamps ?? initialTimestamps
            }),
        }
    )
);
