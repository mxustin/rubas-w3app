// Молекула: боковая панель подключения к MetaMask [★★★☆☆]

import { Drawer, Typography } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { type MetaMaskConnectionTimelineRef } from '@/components/molecules/MetaMaskConnectionTimeline/MetaMaskConnectionTimeline';

import { CancelButton } from '@/components/atoms/Buttons/CancelButton/CancelButton';
import { MetaMaskConnectionTimeline } from '@/components/molecules/MetaMaskConnectionTimeline/MetaMaskConnectionTimeline';
import { useCheckMetaMaskInstalled } from '@/hooks/useCheckMetaMaskInstalled';
import { useCheckMetaMaskUnlocked } from '@/hooks/useCheckMetaMaskUnlocked';
import { useCheckMetaMaskNetwork } from '@/hooks/useCheckMetaMaskNetwork';
import { useCheckMetaMaskAccount } from '@/hooks/useCheckMetaMaskAccount';

import { useWalletStore } from '@/stores/useWalletStore';

import log from '@/log';

import classes from './MetaMaskConnectionDrawer.module.scss';

export interface MetaMaskConnectionDrawerProps {
    open: boolean;
    onClose: () => void;
    onCancel: () => void;
}

export const MetaMaskConnectionDrawer: React.FC<MetaMaskConnectionDrawerProps> = ({
                                                                                      open,
                                                                                      onClose,
                                                                                      onCancel,
                                                                                  }) => {
    const { t } = useTranslation();
    const componentName = 'MetaMaskConnectionDrawer';

    const checkMetaMaskInstalled = useCheckMetaMaskInstalled();
    const checkMetaMaskUnlocked = useCheckMetaMaskUnlocked();
    const checkMetaMaskNetwork = useCheckMetaMaskNetwork();
    const checkMetaMaskAccount = useCheckMetaMaskAccount();

    const account = useWalletStore((state) => state.account);

    const timelineRef = useRef<MetaMaskConnectionTimelineRef>(null);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (open) {
            log.debug(`${componentName}: панель открыта.`);

            setIsFinished(false);

            const interval = setInterval(() => {
                const finished = timelineRef.current?.isWaiting?.() === false;
                if (finished) {
                    setIsFinished(true);
                    clearInterval(interval);
                }
            }, 300);

            return () => clearInterval(interval);
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
                <MetaMaskConnectionTimeline
                    ref={timelineRef}
                    onCheckMetaMaskInstalled={checkMetaMaskInstalled}
                    onCheckMetaMaskUnlocked={checkMetaMaskUnlocked}
                    onCheckMetaMaskNetwork={checkMetaMaskNetwork}
                    onCheckMetaMaskAccount={checkMetaMaskAccount}
                    minStageTime={300}
                />
            </div>

            <div className={classes.footer}>
                {isFinished && account ? (
                    <>
                        <Typography.Text strong>
                            {t('metaMaskDrawer.connected')}
                        </Typography.Text>
                        <br />
                        <Typography.Text type="secondary">
                            {account}
                        </Typography.Text>
                    </>
                ) : (
                    <Typography.Text type="secondary">
                        {t('metaMaskDrawer.footer')}
                    </Typography.Text>
                )}
            </div>
        </Drawer>
    );
};