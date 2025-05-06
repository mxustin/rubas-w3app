// Атомарный компонент: кнопка подключения кошелька (MetaMask)

/**
 * ConnectWalletButton — атомарная кнопка на базе Ant Design для управления подключением кошелька MetaMask (или
 * иного совместимого кошелька).
 *
 * @component ConnectWalletButton
 * @category Atoms
 * @example
 * <ConnectWalletButton>Подключить кошелёк</ConnectWalletButton>
 *
 * Кнопка является атомарным элементом (Atomic Design) и предназначена для управления текущим подключением к кошельку.
 *
 * Использует тип "primary" из Ant Design, что визуально выделяет её среди других кнопок как "основную кнопку".
 * Можно передавать любые свойства, поддерживаемые AntD Button (например, loading, disabled, icon и т.д.).
 *
 * Поддерживает автоматическую локализацию текста, переданного в children, с помощью i18n.
 * Для перевода текста используется ключ из props.children. (Также можно установить какой-то кастомный текст при
 * необходимости.)
 *
 * Поддерживает логирование при нажатии, а также при изменении состояния. Внешний вид определен с использованием общей
 * цветовой схемы приложения.
 *
 * С прицелом на будущее развитие создан useWallet()...
 *
 * @see https://ant.design/components/button/
 */

import { useState, useEffect } from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import log from '../../../../log'; // предполагается, что логгер централизован
import classes from './ConnectWalletButton.module.scss';

export const ConnectWalletButton: React.FC<ButtonProps> = ({ children, ...props }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    // const { connect, isConnecting } = useWallet(); на будущее: для вынесения логики подключения к метамаску в
    //   отдельный компонент
    const componentName = 'ConnectWalletButton';

    const handleConnect = async (): Promise<void> => {
        log.debug(`Кнопка ${componentName}: пользователь нажал на кнопку.`);
        setLoading(true);
        try {
// Здесь будет логика подключения к MetaMask
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const stateName = loading ? 'loading' : 'idle';
        log.debug(`Кнопка ${componentName}: изменение состояния. Состояние изменено на "${stateName}".`);
    }, [loading]);

    return (
        <Button
            type="primary"
            icon={<WalletOutlined />}
            loading={loading}
            onClick={handleConnect}
            className={classes['connect-wallet-button']}
            {...props}
        >
            {children ?? t('connectWalletButton.label')}
        </Button>
    );
};