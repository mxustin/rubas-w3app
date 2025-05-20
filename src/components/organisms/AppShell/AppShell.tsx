// Визуальный компонент-организм AppShell (заголовок главного окна приложения)

/**

 Организм: AppShell — адаптивный интерфейс приложения, который включает в себя: заголовок (header),
 навигационную панель (navbar), боковую панель (aside) и подвал (footer).
 Также содержит кнопку подключения кошелька MetaMask и боковую панель с прогрессом подключения.
 @module AppShell */

import { Layout } from 'antd';
import * as React from 'react';

import { ConnectWalletButton } from '@/components/atoms/Buttons/ConnectWalletButton/ConnectWalletButton';
import { MetaMaskConnectionDrawer } from '@/components/molecules/MetaMaskConnectionDrawer/MetaMaskConnectionDrawer';
import log from '@/log';

import styles from './AppShell.module.scss';

const { Header, Sider, Content, Footer } = Layout;

export const AppShell: React.FC = () => {
    const [isDrawerOpen, setDrawerOpen] = React.useState(false);

    const contentRef = React.useRef<HTMLDivElement>(null);

    const handleOpenDrawer = () => {
        log.debug('AppShell: пользователь нажал кнопку подключения кошелька. Открываем боковую панель.');
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        log.debug('AppShell: пользователь закрыл боковую панель (крестик).');
        setDrawerOpen(false);
    };

    const handleCancelConnection = () => {
        log.debug('AppShell: пользователь отменил подключение к MetaMask. Закрываем боковую панель и сбрасываем процесс.');
        setDrawerOpen(false);
        // TODO: добавить логику отмены подключения (например, через ref)
    };

    return (
        <>
            <Layout className={styles.rootLayout}>
                <Sider width={200} className={styles.sider}>
                    {/* Навигация */}
                </Sider>

                <Layout className={styles.innerLayout}>
                    <Header className={styles.header}>
                        <ConnectWalletButton onClick={handleOpenDrawer} />
                    </Header>

                    <Content className={styles.content} ref={contentRef}>
                        Main Content
                        <MetaMaskConnectionDrawer
                            open={isDrawerOpen}
                            onClose={handleCloseDrawer}
                            onCancel={handleCancelConnection}
                            getContainer={() => contentRef.current!}
                            rootStyle={{ position: 'absolute' }}
                        />
                    </Content>

                    <Footer className={styles.footer}>
                        © 2024 My DApp
                    </Footer>
                </Layout>
            </Layout>
        </>
    );
};