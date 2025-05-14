// Хук для проверки, разблокирован ли MetaMask [★★★☆☆]

import { useCallback } from 'react';

import log from '@/log';

/**

 Хук useCheckMetaMaskUnlocked

 Выполняет попытку запроса аккаунтов через MetaMask (eth_requestAccounts).

 Если аккаунты возвращены — считаем, что MetaMask разблокирован.

 Если ошибка или аккаунтов нет — считаем, что MetaMask заблокирован или пользователь отклонил доступ.

 @returns асинхронная функция, возвращающая boolean: true — MetaMask разблокирован, false — заблокирован
 */
export const useCheckMetaMaskUnlocked = () => {
    return useCallback(async (): Promise<boolean> => {
        if (
            typeof window === 'undefined' ||
            !window.ethereum ||
            typeof window.ethereum.request !== 'function'
        ) {
            log.warn('useCheckMetaMaskUnlocked: MetaMask не найден или window.ethereum недоступен.');
            return false;
        }

        try {
            const accounts: string[] = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            const isUnlocked = Array.isArray(accounts) && accounts.length > 0;

            log.debug(
                `useCheckMetaMaskUnlocked: ${
                    isUnlocked ? 'MetaMask разблокирован, аккаунты получены.' : 'Аккаунты не получены.'
                }`,
            );

            return isUnlocked;
        } catch (error) {
            log.error('useCheckMetaMaskUnlocked: ошибка при запросе аккаунтов:', error);
            return false;
        }
    }, []);
};