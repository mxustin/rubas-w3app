// Молекула: боковая панель подключения к MetaMask [★★★☆☆]

/**
 * MetaMaskConnectionDrawer — молекулярный UI-компонент, реализующий боковую панель,
 * отображающую процесс подключения к MetaMask.
 * Содержит заголовок, кнопку "Отмена", компонент MetaMaskConnectionTimeline и футер.
 * @component MetaMaskConnectionDrawer
 * @category Molecules
 * @example
 *   <MetaMaskConnectionDrawer open={isOpen} onClose={handleClose} onCancel={handleCancel} />
 */

import { Drawer, Typography } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { CancelButton } from '@/components/atoms/Buttons/CancelButton/CancelButton';
import { MetaMaskConnectionTimeline } from '@/components/molecules/MetaMaskConnectionTimeline/MetaMaskConnectionTimeline';
import log from '@/log';

import classes from './MetaMaskConnectionDrawer.module.scss';

export interface MetaMaskConnectionDrawerProps {
    /**
     Флаг открытия панели */
    open: boolean;

    /**
     Обработчик закрытия панели (крестик слева) */
    onClose: () => void;

    /**
     Обработчик отмены подключения (кнопка "Отмена") */
    onCancel: () => void; }

export const MetaMaskConnectionDrawer: React.FC<MetaMaskConnectionDrawerProps> = ({
                                                                                      open,
                                                                                      onClose,
                                                                                      onCancel,
                                                                                  }) => {
    const { t } = useTranslation();
    const componentName = 'MetaMaskConnectionDrawer';

    React.useEffect(() => {
        if (open) {
            log.debug(`${componentName}: панель открыта.`);
        } else {
            log.debug(`${componentName}: панель закрыта.`);
        }
    }, [open]);

    return (
        <Drawer
            title={t('metaMaskDrawer.title')}
            placement="right"
            onClose={onClose}
            open={open}
            width={400}
            className={classes.drawer}
            extra={
                <CancelButton onCancel={onCancel}>
                    {t('cancelButton.label')}
                </CancelButton>
            }
        >
            <div className={classes.content}>
                <MetaMaskConnectionTimeline />
            </div>
            <div className={classes.footer}>
                <Typography.Text type="secondary">
                    {t('metaMaskDrawer.footer')}
                </Typography.Text>
            </div>
        </Drawer>
    );
};

MetaMaskConnectionDrawer.displayName = 'MetaMaskConnectionDrawer';