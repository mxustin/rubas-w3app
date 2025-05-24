// Модуль управления состоянием подключения к MetaMask (zustand + persist) [★★★★★]

/**
 * @fileoverview Модуль управления состоянием подключения к MetaMask
 *
 * Реализует конечный автомат для поэтапного подключения к MetaMask с использованием
 * Zustand для управления состоянием и localStorage для персистентности.
 *
 * Основные возможности:
 * - Отслеживание фаз подключения (установка, разблокировка, сеть, аккаунт)
 * - Сохранение состояния между сессиями через localStorage
 * - Автоматический сброс по таймауту ({@link CONNECTION_RESET_TIMEOUT_MINUTES})
 * - Интеграция с системой логов приложения
 * - Синхронизация с внешним timeline-стораджем
 *
 * @author Максим Устин
 * @version 1.0.0
 * @license MIT
 * @copyright 2025 Rubas Foundation
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CONNECTION_RESET_TIMEOUT_MINUTES } from '@/constants/connection';
import {
    type ConnectionPhase,
    ConnectionPhases,
    type PhaseStatus,
    PhaseStatuses,
} from '@/constants/connectionPhases';
import log from '@/log';
import { usePhaseTimelineStore } from '@/stores/usePhaseTimelineStore';

/**
 * @description Информация о текущей фазе подключения
 *
 * @property {ConnectionPhase}  phase      - Идентификатор текущей фазы подключения
 * @property {PhaseStatus}      status     - Текущий статус выполнения фазы
 * @property {number|null}      timestamp  - Временная метка последнего изменения статуса (Unix timestamp в миллисекундах)
 *
 * @example
 * // Пример объекта PhaseInfo
 * const phaseInfo = {
 *   phase:     'CHECK_IF_INSTALLED',   // Проверка установки MetaMask
 *   status:    'IN_PROGRESS',          // Фаза в процессе выполнения
 *   timestamp: 1640995200000           // Время начала фазы
 * };
 */
export interface PhaseInfo {
    phase:     ConnectionPhase;    // Текущая фаза процесса подключения
    status:    PhaseStatus;        // Статус выполнения фазы
    timestamp: number | null;      // Время последнего изменения (мс)
}

/**
 * @description Полное состояние хранилища управления подключением к MetaMask
 *
 * Включает в себя информацию о статусе подключения, временных метках,
 * и методы для управления жизненным циклом подключения.
 *
 * @property {boolean}   firstTimeConnection       - Флаг первого подключения пользователя
 * @property {number}    lastSuccessfulConnection  - Временная метка последнего успешного подключения (null если не было)
 * @property {Phase}     currentPhase              - Текущая активная фаза подключения
 * @property {Record}    phaseStatuses             - Словарь статусов всех фаз [фаза: статус]
 * @property {Record}    phaseTimestamps           - Словарь временных меток для всех фаз [фаза: timestamp]
 *
 * @property {Function}  firstStart                - Инициализация нового подключения (сброс + старт первой фазы)
 * @property {Function}  reStart                   - Перезапуск текущего подключения (полный сброс прогресса)
 * @property {Function}  goOn                      - Успешное завершение текущей фазы (переход к следующей)
 * @property {Function}  goFail                    - Обработка ошибки выполнения фазы (фиксация статуса FAIL)
 * @property {Function}  cancel                    - Отмена подключения (фиксация статуса CANCELLED)
 * @property {Function}  setPhaseStatus            - Ручное изменение статуса фазы (для кастомных сценариев)
 * @property {Function}  resetStatuses             - Сброс всех статусов к начальным значениям
 * @property {Function}  fullReset                 - Полный сброс состояния (включая персистентные данные)
 * @property {Function}  getPhaseInfo              - Получение информации о текущей фазе (объект PhaseInfo)
 */
export interface ConnectionStoreState {
    // === Состояние подключения ===
    firstTimeConnection:       boolean;                                 // Флаг первого подключения
    lastSuccessfulConnection:  number | null;                           // Время последнего успеха
    currentPhase:              ConnectionPhase;                         // Текущая активная фаза
    phaseStatuses:             Record<ConnectionPhase, PhaseStatus>;    // Статусы фаз
    phaseTimestamps:           Record<ConnectionPhase, number | null>;  // Временные метки фаз

    // === Методы управления состоянием ===

    /**
     * @function firstStart
     * @description Инициализация нового подключения
     * @returns {void}
     */
    firstStart: () => void;

    /**
     * @function reStart
     * @description Перезапуск текущего подключения
     * @returns {void}
     */
    reStart: () => void;

    /**
     * @function goOn
     * @description Успешное завершение текущей фазы и переход к следующей
     * @returns {void}
     */
    goOn: () => void;

    /**
     * @function goFail
     * @description Обработка ошибки выполнения текущей фазы
     * @returns {void}
     */
    goFail: () => void;

    /**
     * @function cancel
     * @description Отмена подключения на текущей фазе
     * @returns {void}
     */
    cancel: () => void;

    /**
     * @function setPhaseStatus
     * @description Ручное изменение статуса конкретной фазы
     * @param {ConnectionPhase} phase - Фаза для изменения
     * @param {PhaseStatus} status - Новый статус фазы
     * @returns {void}
     */
    setPhaseStatus: (phase: ConnectionPhase, status: PhaseStatus) => void;

    /**
     * @function resetStatuses
     * @description Сброс всех статусов к начальным значениям
     * @returns {void}
     */
    resetStatuses: () => void;

    /**
     * @function fullReset
     * @description Полный сброс состояния включая персистентные данные
     * @returns {void}
     */
    fullReset: () => void;

    /**
     * @function getPhaseInfo
     * @description Получение полной информации о текущей фазе
     * @returns {PhaseInfo} Объект с информацией о текущей фазе
     */
    getPhaseInfo: () => PhaseInfo;
}

/**
 * @constant {ConnectionPhase[]} phaseOrder
 * @description Упорядоченный массив фаз подключения к MetaMask
 *
 * Определяет последовательность выполнения фаз:
 * 1. Проверка установки MetaMask в браузере
 * 2. Проверка разблокировки кошелька
 * 3. Проверка подключения к сети BSC
 * 4. Проверка доступности аккаунта
 *
 * @example
 * // Получение следующей фазы
 * const currentIndex = phaseOrder.indexOf(currentPhase);
 * const nextPhase = phaseOrder[currentIndex + 1];
 */
const phaseOrder: ConnectionPhase[] = [
    ConnectionPhases.CHECK_IF_INSTALLED,        // Проверка установки MetaMask
    ConnectionPhases.CHECK_IF_UNLOCKED,         // Проверка разблокировки кошелька
    ConnectionPhases.CHECK_IF_CONNECTED_TO_BSC, // Проверка подключения к BSC
    ConnectionPhases.CHECK_OUT_ACCOUNT,         // Проверка аккаунта
];

/**
 * @constant {Record<ConnectionPhase, PhaseStatus>} initialStatuses
 * @description Начальные статусы для всех фаз подключения
 *
 * Все фазы инициализируются в состоянии WAITING (ожидание).
 * Используется при создании нового состояния или сбросе.
 *
 * @example
 * // Использование при инициализации
 * // eslint-disable-next-line
 * const newState = {
 *   phaseStatuses: { ...initialStatuses }
 * };
 */
const initialStatuses: Record<ConnectionPhase, PhaseStatus> = {
    [ConnectionPhases.CHECK_IF_INSTALLED]:        PhaseStatuses.WAITING,  // Ожидание проверки установки
    [ConnectionPhases.CHECK_IF_UNLOCKED]:         PhaseStatuses.WAITING,  // Ожидание проверки разблокировки
    [ConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: PhaseStatuses.WAITING,  // Ожидание проверки сети
    [ConnectionPhases.CHECK_OUT_ACCOUNT]:         PhaseStatuses.WAITING,  // Ожидание проверки аккаунта
};

/**
 * @constant {Record<ConnectionPhase, number|null>} initialTimestamps
 * @description Начальные временные метки для всех фаз
 *
 * Все временные метки инициализируются как null.
 * Устанавливаются в реальное время при изменении статуса фазы.
 *
 * @example
 * // Использование при сбросе временных меток
 * // eslint-disable-next-line
 * const resetState = {
 *   phaseTimestamps: {...initialTimestamps}
 * };
 */
const initialTimestamps: Record<ConnectionPhase, number | null> = {
    [ConnectionPhases.CHECK_IF_INSTALLED]:        null,  // Время проверки установки
    [ConnectionPhases.CHECK_IF_UNLOCKED]:         null,  // Время проверки разблокировки
    [ConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: null,  // Время проверки сети
    [ConnectionPhases.CHECK_OUT_ACCOUNT]:         null,  // Время проверки аккаунта
};

/**
 * @constant {Function} useConnectionStore
 * @description Главное хранилище состояния подключения к MetaMask
 *
 * Создано с использованием Zustand с middleware для персистентности.
 * Автоматически сохраняет критически важные данные в localStorage
 * и восстанавливает их при загрузке страницы.
 *
 * Особенности:
 * - Автоматический сброс по таймауту неактивности
 * - Синхронизация с внешним timeline store
 * - Детальное логирование всех операций
 * - Миграция данных при изменении структуры
 *
 * @returns {ConnectionStoreState} Объект состояния со всеми методами
 *
 * @example
 * // Использование в React компоненте
 * // eslint-disable-next-line
 * const { currentPhase, firstStart, goOn } = useConnectionStore();
 *
 * // Запуск нового подключения
 * firstStart();
 *
 * // Переход к следующей фазе при успехе
 * goOn();
 */
export const useConnectionStore = create<ConnectionStoreState>()(
    persist(
        (set, get) => {
            // Получение методов для работы с timeline из внешнего store
            const { setTimestamp, resetTimeline } = usePhaseTimelineStore.getState();

            // Инициализация состояния с проверкой существующих значений из localStorage
            const initialState = get() ?? {
                firstTimeConnection:      true,                         // Флаг первого запуска
                lastSuccessfulConnection: null,                         // Время последнего подключения
                currentPhase:             ConnectionPhases.CHECK_IF_INSTALLED,  // Начальная фаза
                phaseStatuses:            { ...initialStatuses },      // Копия начальных статусов
                phaseTimestamps:          { ...initialTimestamps },    // Копия начальных меток
            };

            // === Логика автоматического сброса по таймауту ===

            const now = Date.now();                                     // Текущее время в миллисекундах
            const last = initialState.lastSuccessfulConnection;         // Время последнего успешного подключения

            // Вычисление разности в минутах между текущим временем и последним подключением
            const diffMinutes = last ? (now - last) / 1000 / 60 : Infinity;

            // Определение необходимости сброса состояния
            const shouldReset = diffMinutes > CONNECTION_RESET_TIMEOUT_MINUTES;

            return {
                // Восстановление состояния с учетом возможного сброса по таймауту
                ...initialState,
                firstTimeConnection: shouldReset,  // Сброс флага первого подключения при таймауте

                /**
                 * @method firstStart
                 * @description Инициализация нового подключения с самого начала
                 *
                 * Устанавливает первую фазу в статус IN_PROGRESS и обновляет
                 * соответствующую временную метку. Сбрасывает флаг первого подключения.
                 *
                 * Используется при:
                 * - Первом входе пользователя на страницу
                 * - Ручном запуске процесса подключения
                 *
                 * @returns {void}
                 *
                 * @example
                 * // В React компоненте при нажатии кнопки "Подключить"
                 * // eslint-disable-next-line
                 * const handleConnect = () => {
                 *   firstStart(); eslint-disable-next-line
                 * };
                 */
                firstStart: (): void => {
                    log.debug('[Store] Инициализация нового подключения');

                    // Обновление timeline во внешнем store
                    setTimestamp(ConnectionPhases.CHECK_IF_INSTALLED, PhaseStatuses.IN_PROGRESS);

                    // Обновление локального состояния
                    set((state) => ({
                        currentPhase: ConnectionPhases.CHECK_IF_INSTALLED,  // Установка первой фазы
                        phaseStatuses: {
                            ...state.phaseStatuses,
                            [ConnectionPhases.CHECK_IF_INSTALLED]: PhaseStatuses.IN_PROGRESS,
                        },
                        phaseTimestamps: {
                            ...state.phaseTimestamps,
                            [ConnectionPhases.CHECK_IF_INSTALLED]: Date.now(),  // Фиксация времени начала
                        },
                        firstTimeConnection: false,  // Сброс флага первого подключения
                    }));
                },

                /**
                 * @method reStart
                 * @description Перезапуск процесса подключения с полным сбросом прогресса
                 *
                 * Отличается от firstStart тем, что дополнительно очищает timeline
                 * и сбрасывает все предыдущие статусы фаз. Используется при ошибках
                 * или когда нужно начать процесс заново.
                 *
                 * Используется при:
                 * - Ошибках подключения, требующих полного перезапуска
                 * - Ручном перезапуске пользователем
                 * - Смене аккаунта в MetaMask
                 *
                 * @returns {void}
                 *
                 * @example
                 * // При обработке критической ошибки
                 * // eslint-disable-next-line
                 * const handleError = () => {
                 *   reStart(); // Полный перезапуск процесса eslint-disable-next-line
                 * };
                 */
                reStart: (): void => {
                    log.debug('[Store] Перезапуск текущего подключения');

                    // Полная очистка timeline
                    const { resetTimeline, setTimestamp } = usePhaseTimelineStore.getState();
                    resetTimeline();

                    // Установка первой фазы в активное состояние
                    setTimestamp(ConnectionPhases.CHECK_IF_INSTALLED, PhaseStatuses.IN_PROGRESS);

                    // Обновление состояния с полным сбросом
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

                /**
                 * @method goOn
                 * @description Успешное завершение текущей фазы и переход к следующей
                 *
                 * Выполняет логику конечного автомата:
                 * 1. Помечает текущую фазу как SUCCESS
                 * 2. Переходит к следующей фазе (если есть)
                 * 3. Устанавливает следующую фазу в IN_PROGRESS
                 * 4. При завершении последней фазы обновляет время успешного подключения
                 *
                 * @returns {void}
                 *
                 * @example
                 * // В логике проверки MetaMask
                 * const checkMetaMask = async () => {
                 *   try {
                 *     const isInstalled = await detectMetaMask();
                 *     if (isInstalled) {
                 *       goOn(); // Переход к следующей фазе
                 *     } else {
                 *       goFail(); // Обработка ошибки
                 *     }
                 *   } catch (error) {
                 *     goFail();
                 *   }
                 * };
                 */
                goOn: (): void => {
                    const { currentPhase, phaseStatuses, phaseTimestamps } = get();

                    // Определение позиции текущей фазы в последовательности
                    const currentIndex = phaseOrder.indexOf(currentPhase);
                    const isLast = currentIndex === phaseOrder.length - 1;        // Проверка на последнюю фазу
                    const nextPhase = isLast ? null : phaseOrder[currentIndex + 1]; // Следующая фаза или null

                    log.debug(`[Store] Завершение фазы ${currentPhase} → ${nextPhase}`);

                    // Подготовка обновленных статусов
                    const updatedStatuses = {
                        ...phaseStatuses,
                        [currentPhase]: PhaseStatuses.SUCCESS,  // Текущая фаза завершена успешно
                    };

                    // Подготовка обновленных временных меток
                    const updatedTimestamps = {
                        ...phaseTimestamps,
                        [currentPhase]: Date.now(),  // Время завершения текущей фазы
                    };

                    // Обновление timeline для текущей фазы
                    setTimestamp(currentPhase, PhaseStatuses.SUCCESS);

                    // Если есть следующая фаза - активируем её
                    if (nextPhase) {
                        updatedStatuses[nextPhase] = PhaseStatuses.IN_PROGRESS;
                        updatedTimestamps[nextPhase] = Date.now();
                        setTimestamp(nextPhase, PhaseStatuses.IN_PROGRESS);
                    }

                    // Применение изменений к состоянию
                    set({
                        currentPhase: nextPhase ?? currentPhase,  // Переход к следующей фазе или остаемся
                        phaseStatuses: updatedStatuses,
                        phaseTimestamps: updatedTimestamps,
                        // Обновление времени успешного подключения только при завершении всех фаз
                        lastSuccessfulConnection: isLast ? Date.now() : get().lastSuccessfulConnection,
                    });
                },

                /**
                 * @method goFail
                 * @description Обработка ошибки выполнения текущей фазы
                 *
                 * Устанавливает статус текущей фазы в FAIL и фиксирует время ошибки.
                 * Не переходит к следующей фазе, оставляя возможность повторной попытки
                 * или ручного вмешательства.
                 *
                 * Используется при:
                 * - Технических ошибках (отсутствие MetaMask, проблемы сети)
                 * - Отказе пользователя от действий в MetaMask
                 * - Таймаутах операций
                 *
                 * @returns {void}
                 *
                 * @example
                 * // При ошибке подключения к сети
                 * // eslint-disable-next-line
                 * const connectToNetwork = async () => {
                 *   try {
                 *     await switchNetwork('0x38'); // BSC
                 *     goOn();
                 *   } catch (error) {
                 *     console.error('Ошибка подключения к сети:', error);
                 *     goFail(); // Фиксируем ошибку
                 *   }
                 * };
                 */
                goFail: (): void => {
                    const { currentPhase, phaseStatuses, phaseTimestamps } = get();
                    log.debug(`[Store] Ошибка на фазе ${currentPhase}`);

                    // Обновление timeline
                    setTimestamp(currentPhase, PhaseStatuses.FAIL);

                    // Обновление состояния с фиксацией ошибки
                    set({
                        phaseStatuses: {
                            ...phaseStatuses,
                            [currentPhase]: PhaseStatuses.FAIL,  // Статус ошибки
                        },
                        phaseTimestamps: {
                            ...phaseTimestamps,
                            [currentPhase]: Date.now(),  // Время возникновения ошибки
                        },
                    });
                },

                /**
                 * @method cancel
                 * @description Отмена процесса подключения пользователем
                 *
                 * Устанавливает статус текущей фазы в CANCELLED.
                 * Используется когда пользователь сознательно прерывает процесс подключения.
                 *
                 * Отличается от goFail тем, что указывает на намеренное действие
                 * пользователя, а не на техническую ошибку.
                 *
                 * @returns {void}
                 *
                 * @example
                 * // При нажатии кнопки "Отмена" в UI
                 * // eslint-disable-next-line
                 * const handleCancel = () => {
                 *   cancel();
                 *   // Возврат к начальному экрану eslint-disable-next-line
                 *   router.push('/');
                 * };
                 */
                cancel: (): void => {
                    const { currentPhase, phaseStatuses, phaseTimestamps } = get();
                    log.debug(`[Store] Отмена на фазе ${currentPhase}`);

                    // Обновление timeline
                    setTimestamp(currentPhase, PhaseStatuses.CANCELLED);

                    // Фиксация отмены в состоянии
                    set({
                        phaseStatuses: {
                            ...phaseStatuses,
                            [currentPhase]: PhaseStatuses.CANCELLED,
                        },
                        phaseTimestamps: {
                            ...phaseTimestamps,
                            [currentPhase]: Date.now(),
                        },
                    });
                },

                /**
                 * @method setPhaseStatus
                 * @description Ручное изменение статуса конкретной фазы
                 *
                 * Позволяет программно установить статус любой фазы независимо
                 * от текущего состояния автомата. Полезно для:
                 * - Отладки и тестирования
                 * - Восстановления состояния после ошибок
                 * - Внешнего управления процессом
                 *
                 * @param {ConnectionPhase} phase - Фаза для изменения статуса
                 * @param {PhaseStatus} status - Новый статус фазы
                 * @returns {void}
                 *
                 * @example
                 * // Принудительная установка фазы в состояние ошибки
                 * setPhaseStatus('CHECK_IF_INSTALLED', 'FAIL');
                 *
                 * // Сброс фазы в ожидание
                 * setPhaseStatus('CHECK_OUT_ACCOUNT', 'WAITING');
                 */
                setPhaseStatus: (phase: ConnectionPhase, status: PhaseStatus): void => {
                    const { phaseStatuses, phaseTimestamps } = get();
                    log.debug(`[Store] Ручное изменение статуса ${phase} → ${status}`);

                    // Определение временной метки: для WAITING оставляем существующую, для остальных - текущее время
                    const newTimestamp = status !== PhaseStatuses.WAITING
                        ? Date.now()
                        : phaseTimestamps[phase];

                    // Обновление timeline только для активных статусов
                    if (status !== PhaseStatuses.WAITING) {
                        setTimestamp(phase, status);
                    }

                    // Применение изменений
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

                /**
                 * @method resetStatuses
                 * @description Сброс всех статусов фаз к начальным значениям
                 *
                 * Возвращает все фазы в состояние WAITING и очищает временные метки.
                 * Устанавливает текущую фазу как первую в последовательности.
                 * Также очищает timeline во внешнем store.
                 *
                 * Используется при:
                 * - Подготовке к новому процессу подключения
                 * - Сбросе после ошибок
                 * - Очистке состояния для тестирования
                 *
                 * @returns {void}
                 *
                 * @example
                 * // При смене пользователя или аккаунта
                 * // eslint-disable-next-line
                 * const handleAccountChange = () => {
                 *   resetStatuses(); // Очистка прогресса eslint-disable-next-line
                 *   // Начало нового процесса подключения
                 * };
                 */
                resetStatuses: (): void => {
                    log.debug('[Store] Сброс всех статусов');

                    // Очистка внешнего timeline
                    resetTimeline();

                    // Сброс к начальному состоянию
                    set({
                        currentPhase:    ConnectionPhases.CHECK_IF_INSTALLED,  // Первая фаза
                        phaseStatuses:   { ...initialStatuses },               // Все статусы в WAITING
                        phaseTimestamps: { ...initialTimestamps },             // Все метки времени обнулены
                    });
                },

                /**
                 * @method fullReset
                 * @description Полный сброс состояния включая персистентные данные
                 *
                 * Выполняет максимально полную очистку:
                 * - Сбрасывает все статусы и временные метки
                 * - Очищает timeline
                 * - Восстанавливает флаг первого подключения
                 * - Обнуляет время последнего успешного подключения
                 *
                 * Эквивалентно полному удалению данных из localStorage
                 * и инициализации с нуля.
                 *
                 * @returns {void}
                 *
                 * @example
                 * // При выходе пользователя из системы
                 * // eslint-disable-next-line
                 * const handleLogout = () => {
                 *   fullReset(); // Полная очистка данных подключения eslint-disable-next-line
                 *   // Редирект на страницу входа
                 * };
                 */
                fullReset: (): void => {
                    log.debug('[Store] Полный сброс состояния');

                    // Очистка timeline
                    resetTimeline();

                    // Полное восстановление к изначальному состоянию
                    set({
                        firstTimeConnection:      true,                                // Восстановление флага первого подключения
                        lastSuccessfulConnection: null,                                // Обнуление времени последнего подключения
                        currentPhase:             ConnectionPhases.CHECK_IF_INSTALLED, // Первая фаза
                        phaseStatuses:            { ...initialStatuses },              // Начальные статусы
                        phaseTimestamps:          { ...initialTimestamps },            // Начальные метки времени
                    });
                },

                /**
                 * @method getPhaseInfo
                 * @description Получение полной информации о текущей активной фазе
                 *
                 * Возвращает объект PhaseInfo с информацией о текущей фазе,
                 * её статусе и временной метке. Полезно для отображения
                 * прогресса в UI и принятия решений в логике приложения.
                 *
                 * @returns {PhaseInfo} Объект с информацией о текущей фазе
                 *
                 * @example
                 * // В React компоненте для отображения прогресса
                 * const phaseInfo = getPhaseInfo();
                 * // eslint-disable-next-line
                 * return (
                 *   <div>
                 *     <p>Текущая фаза: {phaseInfo.phase}</p>
                 *     <p>Статус: {phaseInfo.status}</p>
                 *     {phaseInfo.timestamp && (
                 *       <p>Время: {new Date(phaseInfo.timestamp).toLocaleString()}</p>
                 *     )}
                 *   </div>
                 * );
                 */
                getPhaseInfo: (): PhaseInfo => {
                    const { currentPhase, phaseStatuses, phaseTimestamps } = get();
                    return {
                        phase:     currentPhase,
                        status:    phaseStatuses[currentPhase],
                        timestamp: phaseTimestamps[currentPhase],
                    };
                },
            };
        },
        {
            // === Конфигурация персистентности ===

            /**
             * @property {string} name - Ключ для хранения в localStorage
             */
            name: 'connection-storage',

            /**
             * @function partialize
             * @description Селектор данных для сохранения в localStorage
             *
             * Сохраняет только критически важные данные:
             * - Флаг первого подключения
             * - Время последнего успешного подключения
             *
             * Статусы фаз и временные метки не сохраняются, так как
             * они должны сбрасываться при каждом новом запуске.
             *
             * @param {ConnectionStoreState} state - Полное состояние store
             * @returns {Object} Объект с данными для сохранения
             */
            partialize: (state: ConnectionStoreState): object => ({
                firstTimeConnection:      state.firstTimeConnection,
                lastSuccessfulConnection: state.lastSuccessfulConnection,
            }),

            /**
             * @function migrate
             * @description Миграция данных при изменении структуры
             *
             * Обеспечивает совместимость при обновлении приложения.
             * Восстанавливает отсутствующие поля значениями по умолчанию.
             *
             * @param {any} persistedState - Сохраненные данные из localStorage
             * @returns {Object} Мигрированное состояние
             */
            migrate: (persistedState: any): object => ({
                ...persistedState,
                // Обеспечение наличия всех необходимых полей
                lastSuccessfulConnection: persistedState.lastSuccessfulConnection ?? null,
                phaseStatuses:            persistedState.phaseStatuses ?? initialStatuses,
                phaseTimestamps:          persistedState.phaseTimestamps ?? initialTimestamps,
            }),
        }
    )
);
