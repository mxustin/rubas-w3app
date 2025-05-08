// Набор историй для кнопки "Отмена"

import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent } from '@storybook/test';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

import { CancelButton } from './CancelButton';

const withLogger = (Story, context) => {
    const newArgs = {
        ...context.args,
        onCancel: () => {
            action('cancel-clicked')('Кнопка CancelButton: произошло нажатие пользователем.');
            context.args?.onCancel?.();
        },
    };

    return <Story {...context} args={newArgs} />;
};

const meta: Meta<typeof CancelButton> = {
    title: 'Atoms/Buttons/CancelButton',
    component: CancelButton,
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

type Story = StoryObj<typeof CancelButton>;

export const Default: Story = {
    decorators: [withLogger],
    args: {
        onCancel: () => {},
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const button = await canvas.getByRole('button');
        await userEvent.click(button);
        expect(button).toBeEnabled();
        expect(button).toHaveTextContent(/отмена|cancel/i);
    },
};

export const CustomText: Story = {
    decorators: [withLogger],
    args: {
        children: 'Отмена действия',
        onCancel: action('cancel-clicked'),
    },
};

export const Disabled: Story = {
    decorators: [withLogger],
    args: {
        disabled: true,
        onCancel: () => {},
    },
};

export const WithIcon: Story = {
    decorators: [withLogger],
    args: {
        icon: <CloseOutlined />,
        onCancel: () => {},
    },
};

export const Small: Story = {
    decorators: [withLogger],
    args: {
        size: 'small',
        onCancel: () => {},
    },
};

export const Large: Story = {
    decorators: [withLogger],
    args: {
        size: 'large',
        onCancel: () => {},
    },
};