// Константы фаз подключения и статусов [★★★☆☆]

/**
 Фазы процесса подключения:
 • Проверка установки MetaMask
 • Проверка разблокировки кошелька
 • Проверка подключения к сети BSC
 • Получение данных аккаунта
 */

export const ConnectionPhases = {
    CHECK_IF_INSTALLED: 'checkIfMetaMaskInstalled',
    CHECK_IF_UNLOCKED: 'checkIfMetaMaskUnlocked',
    CHECK_IF_CONNECTED_TO_BSC: 'checkIfMetaMaskConnectedToBSC',
    CHECK_OUT_ACCOUNT: 'checkOutMetaMaskAccount',
} as const;

export type ConnectionPhase = typeof ConnectionPhases[keyof typeof ConnectionPhases];

/**
 Возможные статусы для каждой фазы:
 • waiting: Ожидание начала выполнения
 • inprogress: Фаза выполняется
 • success: Успешное завершение
 • fail: Ошибка выполнения
 • cancelled: Отмена выполнения
 */

export const PhaseStatuses = {
    WAITING: 'waiting',
    IN_PROGRESS: 'inprogress',
    SUCCESS: 'success',
    FAIL: 'fail',
    CANCELLED: 'cancelled',
} as const;

export type PhaseStatus = typeof PhaseStatuses[keyof typeof PhaseStatuses];