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
 * Использует тип "primary" из Ant Design, что визуально выделяет её среди других кнопок как "основную кнопку".
 * Можно передавать любые свойства, поддерживаемые AntD Button (например, loading, disabled, icon и т.д.).
 *
 * Поддерживает автоматическую логику локализации текста, переданного в children, с помощью i18n.
 * Для перевода текста используется ключ из props.children. Возможно использование кастомных надписей
 *
 * Поддерживает логирование при нажатии, а также при изменении состояния.
 *
 * С прицелом на будущее развитие создан useWallet().
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import log from '../../../../log'; // предполагается, что логгер централизован
import classes from './ConnectWalletButton.module.scss';
import { useConnectWallet } from '../../../../hooks/useConnectWallet';


export const ConnectWalletButton: React.FC<ButtonProps> = (props) => {
    const { t } = useTranslation();
    const componentName = 'ConnectWalletButton';
    const { connect, loading } = useConnectWallet();

// Логируем изменение состояния
    useEffect(() => {
        const stateName = loading ? 'loading' : 'idle';
        log.debug(`Кнопка ${componentName}: изменение состояния. Состояние изменено на "${stateName}".`);
    }, [loading, componentName]);

// Обработчик клика
    const handleClick = async (): Promise<void> => {
        log.debug(`Кнопка ${componentName}: пользователь нажал на кнопку.`);
        await connect();
    };

    return (
        <Button
            type="primary"
            icon={<WalletOutlined />}
            loading={loading}
            onClick={handleClick}
            className={classes['connect-wallet-button']}
            {...props}
        >
            {props.children ?? t('connectWalletButton.label')}
        </Button>
    );
};
