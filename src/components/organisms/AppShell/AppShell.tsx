// Визуальный компонент-организм AppShell (заголовок главного окна приложения)

/**

 Организм: AppShell — адаптивный интерфейс приложения, который включает в себя: заголовок (header),
 навигационную панель (navbar), боковую панель (aside) и подвал (footer).
 Также содержит кнопку подключения кошелька MetaMask и боковую панель с прогрессом подключения.
 @module AppShell */

import { Layout } from 'antd';
import React from 'react';

import { ConnectWalletButton } from '@/components/atoms/Buttons/ConnectWalletButton/ConnectWalletButton';
import { MetaMaskConnectionDrawer } from '@/components/molecules/MetaMaskConnectionDrawer/MetaMaskConnectionDrawer';
import log from '@/log';

const { Header, Sider, Content } = Layout;

export const AppShell: React.FC = () => {
    const [isDrawerOpen, setDrawerOpen] = React.useState(false);

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
            <Layout style={{ minHeight: '100vh' }}>
                <Sider width={200} style={{ background: '#fff' }}>
                    {/* Навигация */}
                </Sider>

                <Layout>
                    <Header
                        style={{
                            background: '#fff',
                            padding: '0 24px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            height: 64,
                            borderBottom: '1px solid #f0f0f0',
                        }}
                    >
                        <ConnectWalletButton onClick={handleOpenDrawer} />
                    </Header>

                    <Content style={{ margin: '24px', background: '#fff', padding: 24 }}>
                        Main Content
                    </Content>
                </Layout>
            </Layout>

            <MetaMaskConnectionDrawer
                open={isDrawerOpen}
                onClose={handleCloseDrawer}
                onCancel={handleCancelConnection}
            />
        </>
    );
};