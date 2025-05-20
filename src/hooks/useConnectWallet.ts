// Хук useConnectWallet: подключение и отключение MetaMask-кошелька

/**

 Хук useConnectWallet.
 Обрабатывает логику подключения кошелька MetaMask и обновления zustand-стора.
 @module */

import { useCallback, useState } from 'react';

import log from '@/log';
import { useWalletStore } from '@/stores/useWalletStore';

export const useConnectWallet = () => {
    const [loading, setLoading] = useState(false);
    const setWalletState = useWalletStore((state) => state.setState);
    const resetWalletState = useWalletStore((state) => state.resetState);

    const connect = useCallback(async (componentName: string): Promise<void> => {
        log.debug(`useConnectWallet: [${componentName}] — начало подключения к MetaMask`);
        setLoading(true);

        try {
            const isMetaMaskInstalled =
                typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;

            log.debug(`useConnectWallet: MetaMask установлен: ${isMetaMaskInstalled ? 'Да' : 'Нет'}`);

            // Обновляем zustand-стор
            setWalletState({isMetaMaskAvailable: isMetaMaskInstalled});

            // Имитация асинхронной операции
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            log.error(`useConnectWallet: ошибка при подключении к MetaMask`, error);
        } finally {
            setLoading(false);
        }
    }, [setWalletState]);

    const disconnect = useCallback(async (componentName: string): Promise<void> => {
        log.debug(`useConnectWallet: [${componentName}] — начало отключения от MetaMask`);
        setLoading(true);

        try {
            // Имитация асинхронной операции
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Сброс состояния в zustand
            resetWalletState();

            log.debug(`useConnectWallet: [${componentName}] — успешно отключено`);
        } catch (error) {
            log.error(`useConnectWallet: ошибка при отключении от MetaMask`, error);
        } finally {
            setLoading(false);
        }
    }, [resetWalletState]);

    return {
        connect,
        disconnect,
        loading,
    };
};