// История для функции получения заголовков и комментариев для стадий подключения MetaMask

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Select, Space, Typography } from 'antd';

import { mmConnectionComments, MMConnectionPhases, MMConnectionStates } from './mmConnectionComments';

const { Title, Text, Paragraph } = Typography;

type Phase = keyof typeof MMConnectionPhases;
type State = keyof typeof MMConnectionStates;

const phases = Object.entries(MMConnectionPhases).map(([key, value]) => ({
    label: key,
    value,
}));

const states = Object.entries(MMConnectionStates).map(([key, value]) => ({
    label: key,
    value,
}));

type Props = {};

const MMConnectionCommentsExample: React.FC<Props> = () => {
    const [phase, setPhase] = React.useState(MMConnectionPhases.CHECK_IF_INSTALLED);
    const [state, setState] = React.useState(MMConnectionStates.WAITING);

    const { header, comment } = mmConnectionComments(phase, state);

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>mmConnectionComments</Title>
            <Paragraph>
                Демонстрация работы функции mmConnectionComments: отображаются заголовок и
                комментарий для выбранной фазы и состояния.
            </Paragraph>

            <Space>
                <Text strong>Фаза:</Text>
                <Select
                    options={phases}
                    value={phase}
                    onChange={(value) => setPhase(value)}
                    style={{ width: 300 }}
                />
            </Space>

            <Space>
                <Text strong>Состояние:</Text>
                <Select
                    options={states}
                    value={state}
                    onChange={(value) => setState(value)}
                    style={{ width: 300 }}
                />
            </Space>

            <div style={{ marginTop: 24 }}>
                <Paragraph>
                    <Text strong>Заголовок:</Text> {header}
                </Paragraph>
                <Paragraph>
                    <Text strong>Комментарий:</Text> {comment}
                </Paragraph>
            </div>
        </Space>
    );
};

const meta: Meta<typeof MMConnectionCommentsExample> = {
    title: 'Services/mmConnectionComments',
    component: MMConnectionCommentsExample,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: undefined,
        },
    },
};

export default meta;

type Story = StoryObj<typeof MMConnectionCommentsExample>;

export const Default: Story = {};