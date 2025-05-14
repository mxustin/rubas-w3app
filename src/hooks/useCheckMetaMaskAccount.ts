// Хук для получения текущего аккаунта MetaMask [★★★☆☆]

import { useCallback } from 'react';

import log from '@/log';
import { useWalletStore } from '@/stores/useWalletStore';

/**

 Хук useCheckMetaMaskAccount
 Выполняет запрос к MetaMask для получения текущего аккаунта.
 Возвращает true, если аккаунт получен (и логирует его), иначе — false.
 @returns асинхронная функция, возвращающая boolean: true — аккаунт получен, false — ошибка */

export const useCheckMetaMaskAccount = () => { const setWalletState = useWalletStore((state) => state.setState);
    return useCallback(async (): Promise<boolean> => {
        if (
            typeof window === 'undefined' ||
            !window.ethereum ||
            typeof window.ethereum.request !== 'function'
        ) {
            log.warn('useCheckMetaMaskAccount: MetaMask не найден или window.ethereum недоступен.');
            return false;
        }

        try {
            const accounts: string[] = await window.ethereum.request({
                method: 'eth_accounts',
            });

            if (Array.isArray(accounts) && accounts.length > 0) {
                const account = accounts[0];
                log.debug(`useCheckMetaMaskAccount: получен аккаунт: ${account}`);

                // Сохраняем в zustand
                setWalletState({ account });

                return true;
            } else {
                log.warn('useCheckMetaMaskAccount: список аккаунтов пуст.');
                return false;
            }
        } catch (error) {
            log.error('useCheckMetaMaskAccount: ошибка при получении аккаунта:', error);
            return false;
        }
    }, [setWalletState]);
};