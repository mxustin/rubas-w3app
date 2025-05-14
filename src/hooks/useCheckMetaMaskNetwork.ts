// Хук для проверки, подключен ли MetaMask к сети BNB Smart Chain (BSC) [★★★☆☆]

import { useCallback } from 'react';

import { BSC_CHAIN_ID } from '@/constants/network';
import log from '@/log';

/**

 Хук useCheckMetaMaskNetwork

 Проверяет, подключён ли MetaMask к нужной сети (BNB Smart Chain / BSC).

 Возвращает true, если chainId совпадает с ожидаемым (56), иначе — false.

 @returns асинхронная функция, возвращающая boolean: true — сеть корректна, false — нет
 */
export const useCheckMetaMaskNetwork = () => {
    return useCallback(async (): Promise<boolean> => {
        if (
            typeof window === 'undefined' ||
            !window.ethereum ||
            typeof window.ethereum.request !== 'function'
        ) {
            log.warn('useCheckMetaMaskNetwork: MetaMask не найден или window.ethereum недоступен.');
            return false;
        }

        try {
            const chainIdHex: string = await window.ethereum.request({
                method: 'eth_chainId',
            });

            const chainId = parseInt(chainIdHex, 16);
            const isCorrect = chainId === BSC_CHAIN_ID;

            log.debug(
                `useCheckMetaMaskNetwork: получен chainId = ${chainId} (${chainIdHex}), ${
                    isCorrect ? 'сеть корректна (BSC).' : 'неверная сеть!'
                }`,
            );

            return isCorrect;
        } catch (error) {
            log.error('useCheckMetaMaskNetwork: ошибка при получении chainId:', error);
            return false;
        }
    }, []);
};