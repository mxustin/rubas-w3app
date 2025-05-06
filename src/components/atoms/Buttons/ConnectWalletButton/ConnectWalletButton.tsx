// Компонент кнопки подключения кошелька

/**
 * Кнопка для подключения Web3-кошелька (MetaMask)
 * @component
 * @example
 * <ConnectWalletButton />
 */

import { useState } from 'react';
import { Button } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import classes from './ConnectWalletButton.module.scss';

export const ConnectWalletButton: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
// Здесь будет логика подключения к MetaMask
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            type="primary"
            icon={<WalletOutlined />}
            loading={loading}
            onClick={handleConnect}
            className="connect-wallet-button"
        >
            Connect Wallet
        </Button>
    );
};