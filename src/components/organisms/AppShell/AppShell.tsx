// Визуальный компонент-организм AppShell<br> (заголовок главного окна приложения)

/**
 * Организм: AppShell - адаптивный интерфейс приложения, который включает в себя: заголовок (header), навигационную
 *   панель (navbar), боковую панель (aside) и подвал (footer).
 * @module
 */

import { Layout } from 'antd';
import { ConnectWalletButton } from '../../atoms/Buttons/ConnectWalletButton/ConnectWalletButton.tsx';

const { Header, Sider, Content } = Layout;

export const AppShell: React.FC = () => {
    return (
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
                    <ConnectWalletButton />
                </Header>

                <Content style={{ margin: '24px', background: '#fff', padding: 24 }}>
                    Main Content
                </Content>
            </Layout>
        </Layout>
    );
};