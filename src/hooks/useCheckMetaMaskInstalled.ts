// Хук для проверки наличия MetaMask [★★☆☆☆]

import { useCallback } from 'react';

import log from '@/log';

export const useCheckMetaMaskInstalled = () => {
    return useCallback(async (): Promise<boolean> => {
        const result = typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
        log.debug(`useCheckMetaMaskInstalled: MetaMask ${result ? 'обнаружен' : 'не обнаружен'}`);
        return result;
    }, []);
};