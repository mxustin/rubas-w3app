// Компонент кнопки подключения кошелька

/**
 * Кнопка для подключения Web3-кошелька (MetaMask)
 * @component
 * @example
 * <ConnectWalletButton />
 */

import { useState } from 'react';
import { Button } from '@mantine/core';
import classes from './ConnectWalletButton.module.scss';

export const ConnectWalletButton: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
            // Здесь будет логика подключения к MetaMask (см. следующий шаг)
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="filled"
            radius="md"
            loading={loading}
            loaderProps={{ type: 'dots' }}
            onClick={handleConnect}
            leftSection={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="3" y="5" width="16" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            }
            className={classes.connectWalletButton}
        >
            Connect Wallet
        </Button>
    );
};