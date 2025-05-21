// История для хранилища useConnectionStore — визуальный playground

import { type Meta, type StoryObj } from '@storybook/react';
import { Button, Divider, message,Space, Tag, Typography } from 'antd';
import { useEffect } from 'react';
import * as React from 'react';

import log from '@/log';
import {
    type ConnectionPhase,
    ConnectionPhases,
    PhaseStatuses,
    useConnectionStore,
} from '@/stores/useConnectionStore';

const { Title, Text } = Typography;

const DevConnectionStorePanel: React.FC = () => {
    const {
        currentPhase,
        phaseStatuses,
        phaseTimestamps,
        firstTimeConnection,
        lastSuccessfulConnection,
        firstStart,
        reStart,
        goOn,
        goFail,
        cancel,
        resetStatuses,
        fullReset,
    } = useConnectionStore();

    useEffect(() => {
        fullReset();
        log.debug('Storybook: выполнен принудительный сброс состояния хранилища');
    }, [fullReset]);

    const renderPhase = (phase: ConnectionPhase) => {
        const status = phaseStatuses[phase];
        const time = phaseTimestamps[phase];
        const colorMap: Record<string, string> = {
            waiting: 'default',
            inprogress: 'processing',
            success: 'green',
            fail: 'red',
            cancelled: 'orange',
        };

        return (
            <div key={phase} style={{ marginBottom: 4 }}>
                <Text strong>{phase}</Text> — <Tag color={colorMap[status] ?? 'default'}>{status}</Tag>
                {time && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                        {new Date(time).toLocaleTimeString()}
                    </Text>
                )}
            </div>
        );
    };

    const handleFullReset = () => {
        fullReset();
        message.success('✅ Полный сброс состояния выполнен (включая persistent)');
    };

    return (
        <div style={{ padding: 24, maxWidth: 640 }}>
            <Title level={4}>🧪 Zustand Playground: useConnectionStore</Title>

            <Divider>🧭 Текущее состояние</Divider>
            <Text>
                <strong>Текущая фаза:</strong> <Tag color="blue">{currentPhase}</Tag>
            </Text>
            <br />
            <Text>
                <strong>Первое подключение:</strong>{' '}
                <Tag color={firstTimeConnection ? 'green' : 'default'}>
                    {String(firstTimeConnection)}
                </Tag>
            </Text>
            <br />
            <Text>
                <strong>Последнее успешное подключение:</strong>{' '}
                {lastSuccessfulConnection ? (
                    <Text code>{new Date(lastSuccessfulConnection).toLocaleString()}</Text>
                ) : (
                    '—'
                )}
            </Text>

            <Divider>📋 Статусы фаз</Divider>
            <div style={{ marginBottom: 12 }}>
                {Object.values(ConnectionPhases).map((phase) =>
                    renderPhase(phase as ConnectionPhase),
                )}
            </div>

            <Divider>⚙️ Управление</Divider>
            <Space wrap>
                <Button type="primary" onClick={firstStart}>
                    firstStart
                </Button>
                <Button onClick={reStart}>reStart</Button>
                <Button onClick={goOn}>goOn</Button>
                <Button danger onClick={goFail}>
                    goFail
                </Button>
                <Button danger onClick={cancel}>
                    cancel
                </Button>
                <Button onClick={resetStatuses}>resetStatuses</Button>
                <Button onClick={handleFullReset} type="dashed">
                    fullReset
                </Button>
            </Space>

            <Divider>🎨 Возможные статусы фаз</Divider>
            <div style={{ marginBottom: 12 }}>
                {Object.values(PhaseStatuses).map((status) => {
                    const colorMap: Record<string, string> = {
                        waiting: 'default',
                        inprogress: 'processing',
                        success: 'green',
                        fail: 'red',
                        cancelled: 'orange',
                    };
                    return (
                        <div key={status} style={{ marginBottom: 4 }}>
                            <Text strong>{status}</Text>{' '}
                            <Tag color={colorMap[status] ?? 'default'}>{status}</Tag>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const meta: Meta<typeof DevConnectionStorePanel> = {
    title: 'Stores/useConnectionStore',
    component: DevConnectionStorePanel,
    parameters: {
        layout: 'centered',
        docs: { page: undefined },
    },
    decorators: [
        (Story) => {
            useEffect(() => {
                useConnectionStore.getState().fullReset();
                log.debug('Storybook: выполнена предварительная инициализация хранилища');
            }, []);
            return <Story />;
        },
    ],
};

export default meta;

type Story = StoryObj<typeof DevConnectionStorePanel>;

export const Default: Story = {
    render: () => <DevConnectionStorePanel />,
};
