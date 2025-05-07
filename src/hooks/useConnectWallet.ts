// src/hooks/useConnectWallet.ts

/**

 Хук useConnectWallet.
 Обрабатывает логику подключения кошелька MetaMask и обновления zustand-стора.
 @module */

import { useCallback, useState } from 'react';
import log from '../log';
import { useWalletStore } from '../stores/useWalletStore';

export const useConnectWallet = () => {
    const [loading, setLoading] = useState(false);
    const setWalletState = useWalletStore((state) => state.setState);

    const connect = useCallback(async () => {
        log.debug('useConnectWallet: начало подключения к MetaMask');
        setLoading(true);

        try {
            const isMetaMaskInstalled =
                typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;

            log.debug(`MetaMask установлен: ${isMetaMaskInstalled ? 'Да' : 'Нет'}`);

            // Обновляем zustand-стор
            setWalletState({ isMetaMaskAvailable: isMetaMaskInstalled });

            // Имитация асинхронной операции
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            log.error('Ошибка при подключении к MetaMask:', error);
        } finally {
            setLoading(false);
        }
    }, [setWalletState]);

    return { connect, loading };
};