import * as React from 'react';

import log from '@/log';

type WalletButtonState = 'disconnected' | 'connected';

export const useWalletButtonState = () => {
    const [state, setState] = React.useState<WalletButtonState>('disconnected');

    const setConnected = (): void => {
        setState((prev) => {
            const next = prev === 'disconnected' ? 'connected' : 'disconnected';
            log.debug(`useWalletButtonState: переключение состояния с "${prev}" на "${next}"`);
            return next;
        });
    };

    const setDisconnected = (): void => {
        log.debug('useWalletButtonState: сброс состояния в "disconnected"');
        setState('disconnected');
    };

    return {
        state,
        setConnected,
        setDisconnected,
    };
};