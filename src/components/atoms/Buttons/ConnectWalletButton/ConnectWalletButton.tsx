// Атомарный компонент: кнопка подключения кошелька (MetaMask) [★★★★★]

import { PoweroffOutlined, WalletOutlined } from '@ant-design/icons';
import { Button,type ButtonProps } from 'antd';
import * as React from "react";
import { useTranslation } from 'react-i18next';

import { useConnectWallet } from '@/hooks/useConnectWallet';
import { useWalletButtonState } from '@/hooks/useWalletButtonState';
import log from '@/log';

import classes from './ConnectWalletButton.module.scss';

/**
 * ConnectWalletButton — атомарная кнопка на базе Ant Design для управления подключением или отключением кошелька
 * MetaMask (или иного совместимого кошелька, если это предусмотрено в проекте). Поддерживает состояния: основное
 * (при нажатии будет осуществлено подключение), промежуточное (происходит подключение), и реверсивное (при нажатии
 * будет выполнено отключение). Поддерживает локализацию с помощью i18n (при необходимости может быть установлена
 * любая надпись через props.children). Поддерживает логирование при нажатии и при изменении состояния.
 *
 * @component ConnectWalletButton
 * @category Atoms
 * @example
 *   <ConnectWalletButton>Подключить кошелёк</ConnectWalletButton>
 */

export const ConnectWalletButton: React.FC<ButtonProps> = (props) => {
    const { t } = useTranslation();
    const componentName = 'ConnectWalletButton';
    const { connect, disconnect, loading } = useConnectWallet();              // хук для подключения/отключения кошелька
    const { state, setConnected, setDisconnected } = useWalletButtonState();  // хук для управления состоянием кнопки

    // Логируем текущее состояние и статус загрузки при изменении
    React.useEffect(() => {
        const current = loading ? 'loading' : 'idle';
        log.debug(`Кнопка ${componentName}: состояние "${state}", статус загрузки: ${current}`);
    }, [loading, state]);

    // Обработчик нажатия на кнопку
    const handleClick = async (): Promise<void> => {
        log.debug(`Кнопка ${componentName}: нажата пользователем в состоянии "${state}"`);
        if (state === 'connected') {
            // Если уже подключено — отключаемся
            await disconnect(componentName);
            setDisconnected();  // Сбрасываем состояние кнопки на "disconnected"
        } else {
            // Иначе — подключаемся
            await connect(componentName);
            setConnected(); // Переключаем состояние кнопки на "connected"
        }
    };

    // Флаг текущего состояния
    const isConnected = state === 'connected';

    return (
        <Button
            type={isConnected ? 'default' : 'primary'}     // "primary" — для подключения, "default" — для отключения
            danger={isConnected}                           // Красная кнопка, если отключение
            icon={                                         // Иконка зависит от состояния
                isConnected ? <PoweroffOutlined /> : <WalletOutlined />
            }
            loading={loading}                              // Показываем лоадер во время асинхронной операции
            onClick={handleClick}                          // Обработчик клика
            className={classes['connect-wallet-button']}   // Класс для стилизации (min-width: 230px)
            {...props}                                     // Дополнительные пропсы, если переданы
        >
            {/* Если переданы children — используем их, иначе — локализованный текст */}
            {props.children ?? t(isConnected ? 'connectWalletButton.disconnect' : 'connectWalletButton.connect')}
        </Button>
    );
};