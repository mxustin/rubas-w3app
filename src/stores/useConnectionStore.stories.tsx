// История для хранилища useConnectionStore — визуальный playground с тестами

import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Button, Divider, message, Space, Tag, Typography } from 'antd';
import { useEffect } from 'react';
import * as React from 'react';

import {
    type ConnectionPhase,
    ConnectionPhases,
    PhaseStatuses,
} from '@/constants/connectionPhases';
import log from '@/log';
import { useConnectionStore } from '@/stores/useConnectionStore';
import { usePhaseTimelineStore } from '@/stores/usePhaseTimelineStore';

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

    const { timeline, resetTimeline } = usePhaseTimelineStore();

    useEffect(() => {
        fullReset();
        resetTimeline();
        log.debug('Storybook: выполнен принудительный сброс состояния хранилища');
    }, [fullReset, resetTimeline]);

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
            <div key={phase} style={{ marginBottom: 4 }} data-testid={`phase-${phase}`}>
                <Text strong>{phase}</Text> —{' '}
                <Tag
                    color={colorMap[status] ?? 'default'}
                    data-testid={`status-${phase}`}
                >
                    {status}
                </Tag>
                {time && (
                    <Text
                        type="secondary"
                        style={{ marginLeft: 8 }}
                        data-testid={`time-${phase}`}
                    >
                        {new Date(time).toLocaleTimeString()}
                    </Text>
                )}
            </div>
        );
    };

    const handleFullReset = () => {
        fullReset();
        resetTimeline();
        message.success('✅ Полный сброс состояния выполнен (включая persistent)');
    };

    return (
        <div style={{ padding: 24, maxWidth: 740 }} data-testid="connection-store-panel">
            <Title level={4}>🧪 Zustand Playground: useConnectionStore</Title>

            <Divider>🧭 Текущее состояние</Divider>
            <Text>
                <strong>Текущая фаза:</strong>{' '}
                <Tag color="blue" data-testid="current-phase">
                    {currentPhase}
                </Tag>
            </Text>
            <br />
            <Text>
                <strong>Первое подключение:</strong>{' '}
                <Tag
                    color={firstTimeConnection ? 'green' : 'default'}
                    data-testid="first-time-connection"
                >
                    {String(firstTimeConnection)}
                </Tag>
            </Text>
            <br />
            <Text>
                <strong>Последнее успешное подключение:</strong>{' '}
                {lastSuccessfulConnection ? (
                    <Text code data-testid="last-success-time">
                        {new Date(lastSuccessfulConnection).toLocaleString()}
                    </Text>
                ) : (
                    <span data-testid="no-success-time">—</span>
                )}
            </Text>

            <Divider>📋 Статусы фаз</Divider>
            <div style={{ marginBottom: 12 }} data-testid="phases-list">
                {Object.values(ConnectionPhases).map((phase) =>
                    renderPhase(phase as ConnectionPhase),
                )}
            </div>

            <Divider>⚙️ Управление</Divider>
            <Space wrap data-testid="control-buttons">
                <Button
                    type="primary"
                    onClick={firstStart}
                    data-testid="btn-first-start"
                >
                    firstStart
                </Button>
                <Button
                    onClick={reStart}
                    data-testid="btn-restart"
                >
                    reStart
                </Button>
                <Button
                    onClick={goOn}
                    data-testid="btn-go-on"
                >
                    goOn
                </Button>
                <Button
                    danger
                    onClick={goFail}
                    data-testid="btn-go-fail"
                >
                    goFail
                </Button>
                <Button
                    danger
                    onClick={cancel}
                    data-testid="btn-cancel"
                >
                    cancel
                </Button>
                <Button
                    onClick={resetStatuses}
                    data-testid="btn-reset-statuses"
                >
                    resetStatuses
                </Button>
                <Button
                    onClick={handleFullReset}
                    type="dashed"
                    data-testid="btn-full-reset"
                >
                    fullReset
                </Button>
            </Space>

            <Divider>🎨 Возможные статусы фаз</Divider>
            <div style={{ marginBottom: 12 }} data-testid="status-reference">
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

            <Divider>🕒 Временные метки всех фаз и состояний</Divider>
            <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                <table
                    style={{ borderCollapse: 'collapse', width: '100%', minWidth: 640 }}
                    data-testid="timeline-table"
                >
                    <thead>
                    <tr>
                        <th
                            style={{
                                border: '1px solid #ddd',
                                padding: 8,
                                background: '#fafafa'
                            }}
                        >
                            Фаза
                        </th>
                        {Object.values(ConnectionPhases).map((phase) => {
                            // Сопоставление фаз с короткими метками
                            const phaseLabels: Record<ConnectionPhase, string> = {
                                [ConnectionPhases.CHECK_IF_INSTALLED]:    'Налич.',
                                [ConnectionPhases.CHECK_IF_UNLOCKED]:     'Блок.',
                                [ConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: 'Сеть',
                                [ConnectionPhases.CHECK_OUT_ACCOUNT]:     'Аккаунт'
                            };
                            return (
                                <th
                                    key={phase}
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: 8,
                                        background: '#fafafa',
                                        textAlign: 'center',
                                    }}
                                >
                                    {phaseLabels[phase]}
                                </th>
                            );
                        })}
                    </tr>
                    </thead>
                    <tbody>
                    {Object.values(PhaseStatuses).map((status) => (
                        <tr key={status}>
                            <td style={{ border: '1px solid #ddd', padding: 8 }}>
                                <Text code>{status}</Text>
                            </td>
                            {Object.values(ConnectionPhases).map((phase) => {
                                const timestamp = timeline[phase]?.[status] ?? null;
                                return (
                                    <td
                                        key={`${phase}-${status}`}
                                        style={{
                                            border: '1px solid #ddd',
                                            padding: 8,
                                            textAlign: 'center',
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            color: timestamp ? '#000' : '#999',
                                        }}
                                        data-testid={`timeline-${phase}-${status}`}
                                    >
                                        {timestamp ? new Date(timestamp).toLocaleTimeString() : '—'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
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
                usePhaseTimelineStore.getState().resetTimeline();
                log.debug('Storybook: выполнена предварительная инициализация хранилища');
            }, []);
            return <Story />;
        },
    ],
};

export default meta;

type Story = StoryObj<typeof DevConnectionStorePanel>;

// === БАЗОВЫЙ СЦЕНАРИЙ ===
export const Default: Story = {
    render: () => <DevConnectionStorePanel />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Проверяем начальное состояние после полного сброса
        await expect(canvas.getByTestId('current-phase')).toHaveTextContent(
            ConnectionPhases.CHECK_IF_INSTALLED
        );

        await expect(canvas.getByTestId('first-time-connection')).toHaveTextContent('true');

        // Проверяем, что все фазы в состоянии WAITING
        const phases = Object.values(ConnectionPhases);
        for (const phase of phases) {
            const statusElement = canvas.getByTestId(`status-${phase}`);
            await expect(statusElement).toHaveTextContent(PhaseStatuses.WAITING);
        }

        // Проверяем отсутствие времени последнего успешного подключения
        await expect(canvas.getByTestId('no-success-time')).toBeInTheDocument();
    },
};

// === ТЕСТ БАЗОВОГО ПОТОКА ===
export const BasicConnectionFlow: Story = {
    render: () => <DevConnectionStorePanel />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // 1. Инициализируем подключение
        const firstStartBtn = canvas.getByTestId('btn-first-start');
        await userEvent.click(firstStartBtn);

        // Проверяем, что первая фаза стала IN_PROGRESS
        await expect(canvas.getByTestId(`status-${ConnectionPhases.CHECK_IF_INSTALLED}`))
            .toHaveTextContent(PhaseStatuses.IN_PROGRESS);

        await expect(canvas.getByTestId('first-time-connection')).toHaveTextContent('false');

        // 2. Переходим к следующей фазе
        const goOnBtn = canvas.getByTestId('btn-go-on');
        await userEvent.click(goOnBtn);

        // Проверяем переход фаз
        await expect(canvas.getByTestId(`status-${ConnectionPhases.CHECK_IF_INSTALLED}`))
            .toHaveTextContent(PhaseStatuses.SUCCESS);

        await expect(canvas.getByTestId(`status-${ConnectionPhases.CHECK_IF_UNLOCKED}`))
            .toHaveTextContent(PhaseStatuses.IN_PROGRESS);

        await expect(canvas.getByTestId('current-phase'))
            .toHaveTextContent(ConnectionPhases.CHECK_IF_UNLOCKED);

        // 3. Завершаем все фазы
        await userEvent.click(goOnBtn); // CHECK_IF_UNLOCKED -> SUCCESS
        await userEvent.click(goOnBtn); // CHECK_IF_CONNECTED_TO_BSC -> IN_PROGRESS
        await userEvent.click(goOnBtn); // CHECK_OUT_ACCOUNT -> IN_PROGRESS (последняя фаза)

        // Проверяем финальное состояние
        await expect(canvas.getByTestId(`status-${ConnectionPhases.CHECK_OUT_ACCOUNT}`))
            .toHaveTextContent(PhaseStatuses.SUCCESS);

        // Проверяем, что появилось время последнего успешного подключения
        const lastSuccessElement = canvas.queryByTestId('last-success-time');
        if (lastSuccessElement) {
            await expect(lastSuccessElement).toBeInTheDocument();
        }
    },
};

// === ТЕСТ ОБРАБОТКИ ОШИБОК ===
export const ErrorHandlingFlow: Story = {
    render: () => <DevConnectionStorePanel />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // 1. Инициализируем подключение
        const firstStartBtn = canvas.getByTestId('btn-first-start');
        await userEvent.click(firstStartBtn);

        // 2. Имитируем ошибку на первой фазе
        const goFailBtn = canvas.getByTestId('btn-go-fail');
        await userEvent.click(goFailBtn);

        // Проверяем, что фаза помечена как FAIL
        await expect(canvas.getByTestId(`status-${ConnectionPhases.CHECK_IF_INSTALLED}`))
            .toHaveTextContent(PhaseStatuses.FAIL);

        // Проверяем, что текущая фаза не изменилась
        await expect(canvas.getByTestId('current-phase'))
            .toHaveTextContent(ConnectionPhases.CHECK_IF_INSTALLED);

        // 3. Тестируем отмену
        const restartBtn = canvas.getByTestId('btn-restart');
        await userEvent.click(restartBtn);

        const cancelBtn = canvas.getByTestId('btn-cancel');
        await userEvent.click(cancelBtn);

        // Проверяем статус CANCELLED
        await expect(canvas.getByTestId(`status-${ConnectionPhases.CHECK_IF_INSTALLED}`))
            .toHaveTextContent(PhaseStatuses.CANCELLED);
    },
};

// === ТЕСТ ФУНКЦИЙ СБРОСА ===
export const ResetFunctionality: Story = {
    render: () => <DevConnectionStorePanel />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // 1. Создаем некоторое состояние
        const firstStartBtn = canvas.getByTestId('btn-first-start');
        await userEvent.click(firstStartBtn);

        const goOnBtn = canvas.getByTestId('btn-go-on');
        await userEvent.click(goOnBtn); // Переходим к следующей фазе

        // 2. Тестируем resetStatuses
        const resetStatusesBtn = canvas.getByTestId('btn-reset-statuses');
        await userEvent.click(resetStatusesBtn);

        // Проверяем сброс статусов
        await expect(canvas.getByTestId('current-phase'))
            .toHaveTextContent(ConnectionPhases.CHECK_IF_INSTALLED);

        const phases = Object.values(ConnectionPhases);
        for (const phase of phases) {
            const statusElement = canvas.getByTestId(`status-${phase}`);
            await expect(statusElement).toHaveTextContent(PhaseStatuses.WAITING);
        }

        // 3. Создаем состояние снова для теста fullReset
        await userEvent.click(firstStartBtn);
        await userEvent.click(goOnBtn);

        // 4. Тестируем fullReset
        const fullResetBtn = canvas.getByTestId('btn-full-reset');
        await userEvent.click(fullResetBtn);

        // Проверяем полный сброс
        await expect(canvas.getByTestId('first-time-connection')).toHaveTextContent('true');
        await expect(canvas.getByTestId('no-success-time')).toBeInTheDocument();

        for (const phase of phases) {
            const statusElement = canvas.getByTestId(`status-${phase}`);
            await expect(statusElement).toHaveTextContent(PhaseStatuses.WAITING);
        }
    },
};

// === ТЕСТ ВРЕМЕННЫХ МЕТОК ===
export const TimelineTracking: Story = {
    render: () => <DevConnectionStorePanel />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // 1. Инициализируем подключение
        const firstStartBtn = canvas.getByTestId('btn-first-start');
        await userEvent.click(firstStartBtn);

        // Проверяем, что появилась временная метка для IN_PROGRESS
        const timeElement = canvas.queryByTestId(`time-${ConnectionPhases.CHECK_IF_INSTALLED}`);
        if (timeElement) {
            await expect(timeElement).toBeInTheDocument();
        }

        // 2. Переходим к успеху
        const goOnBtn = canvas.getByTestId('btn-go-on');
        await userEvent.click(goOnBtn);

        // Проверяем запись в timeline для SUCCESS
        const timelineCell = canvas.queryByTestId(
            `timeline-${ConnectionPhases.CHECK_IF_INSTALLED}-${PhaseStatuses.SUCCESS}`
        );
        if (timelineCell) {
            await expect(timelineCell).not.toHaveTextContent('—');
        }

        // 3. Проверяем, что IN_PROGRESS появился для следующей фазы
        const nextPhaseTimeElement = canvas.queryByTestId(`time-${ConnectionPhases.CHECK_IF_UNLOCKED}`);
        if (nextPhaseTimeElement) {
            await expect(nextPhaseTimeElement).toBeInTheDocument();
        }
    },
};
