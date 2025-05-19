// История для компонента ConnectWalletButton (без теста)

import { PoweroffOutlined,WalletOutlined } from '@ant-design/icons';
import { type Meta, type StoryObj } from '@storybook/react';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/i18n';

import { ConnectWalletButton } from './ConnectWalletButton';

const meta: Meta<typeof ConnectWalletButton> = {
    title: 'Atoms/Buttons/ConnectWalletButton',
    component: ConnectWalletButton,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <I18nextProvider i18n={i18n}>
                <div style={{ padding: '20px', background: '#f0f2f5' }}>
                    <Story />
                </div>
            </I18nextProvider>
        ),
    ],
    parameters: {
        docs: {
            page: undefined,
        },
    },
};

export default meta;

type Story = StoryObj<typeof ConnectWalletButton>;

export const Default: Story = {
    args: {},
};

export const CustomText: Story = {
    args: {
        children: 'Подключить RUBAS-кошелёк',
    },
};

export const Connected: Story = {
    args: {
        type: 'default',
        danger: true,
        icon: <PoweroffOutlined />,
        children: 'Отключить кошелёк',
    },
};

export const Loading: Story = {
    args: {
        loading: true,
        icon: <WalletOutlined />,
        children: 'Подключение...',
    },
};

export const WithIconOnly: Story = {
    args: {
        icon: <WalletOutlined />,
    },
};