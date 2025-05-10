// История для компонента MetaMaskConnectionTimeline

import { Button, Space } from 'antd';
import React, { useRef } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { expect, within, userEvent } from '@storybook/test';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

import { MMConnectionPhases, MMConnectionStates } from '@/services/mmConnectionComments';
import { MetaMaskConnectionTimeline, type MetaMaskConnectionTimelineRef } from './MetaMaskConnectionTimeline';

const meta: Meta<typeof MetaMaskConnectionTimeline> = {
    title: 'Molecules/MetaMaskConnectionTimeline',
    component: MetaMaskConnectionTimeline,
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
            page: undefined, // Важно! Используем autodocs
        },
    },
};

export default meta;

type Story = StoryObj<typeof MetaMaskConnectionTimeline>;

// Базовый пример с кнопками управления
export const Default: Story = {
    render: (args) => {
        const timelineRef = useRef<MetaMaskConnectionTimelineRef>(null);

        const handleGoOn = () => {
            timelineRef.current?.goOn();
            action('goOn')('Переход к следующей стадии');
        };

        const handleBreak = () => {
            timelineRef.current?.break();
            action('break')('Прерывание процесса');
        };

        const handleReset = () => {
            timelineRef.current?.reset();
            action('reset')('Сброс состояния');
        };

        return (
            <div>
                <MetaMaskConnectionTimeline
                    {...args}
                    ref={timelineRef}
                    onGoOn={() => action('onGoOn')('Внешний обработчик goOn')}
                    onBreak={() => action('onBreak')('Внешний обработчик break')}
                    onReset={() => action('onReset')('Внешний обработчик reset')}
                />
                <Space style={{ marginTop: 16 }}>
                    <Button type="primary" onClick={handleGoOn}>GoOn</Button>
                    <Button danger onClick={handleBreak}>Break</Button>
                    <Button onClick={handleReset}>Reset</Button>
                </Space>
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const goOnButton = await canvas.findByText('GoOn');

        // Нажимаем кнопку GoOn
        await userEvent.click(goOnButton);

        // Проверяем, что появился текст успешного завершения первой фазы
        await expect(canvas.findByText(/MetaMask extension detected/i)).resolves.toBeInTheDocument();
    },
};

// Контролируемый компонент с возможностью изменять состояние снаружи
export const ControlledComponent: Story = {
    render: (args) => {
        const [phases, setPhases] = React.useState({
            [MMConnectionPhases.CHECK_IF_INSTALLED]: MMConnectionStates.SUCCESS,
            [MMConnectionPhases.CHECK_IF_UNLOCKED]: MMConnectionStates.IN_PROGRESS,
            [MMConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: MMConnectionStates.WAITING,
            [MMConnectionPhases.CHECK_OUT_ACCOUNT]: MMConnectionStates.WAITING,
        });

        return (
            <div>
                <MetaMaskConnectionTimeline {...args} phases={phases} />
                <Space style={{ marginTop: 16 }}>
                    <Button
                        onClick={() => {
                            setPhases({
                                [MMConnectionPhases.CHECK_IF_INSTALLED]: MMConnectionStates.SUCCESS,
                                [MMConnectionPhases.CHECK_IF_UNLOCKED]: MMConnectionStates.SUCCESS,
                                [MMConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: MMConnectionStates.IN_PROGRESS,
                                [MMConnectionPhases.CHECK_OUT_ACCOUNT]: MMConnectionStates.WAITING,
                            });
                        }}
                    >
                        Update State
                    </Button>
                </Space>
            </div>
        );
    },
};

// Пример с имитацией ошибки на второй фазе
export const WithFailedPhase: Story = {
    render: (args) => {
        const timelineRef = useRef<MetaMaskConnectionTimelineRef>(null);

        const runFailedDemo = () => {
            setTimeout(() => {
                timelineRef.current?.goOn(); // Первая фаза успешна
                setTimeout(() => {
                    timelineRef.current?.break(); // Вторая фаза завершается с ошибкой
                }, 1000);
            }, 500);
        };

        React.useEffect(() => {
            runFailedDemo();
        }, []);

        return (
            <div>
                <MetaMaskConnectionTimeline
                    {...args}
                    ref={timelineRef}
                    minStageTime={500}
                />
                <Space style={{ marginTop: 16 }}>
                    <Button onClick={() => timelineRef.current?.reset()}>Reset</Button>
                    <Button onClick={runFailedDemo}>Restart Demo</Button>
                </Space>
            </div>
        );
    },
};
