import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/i18n';

import { MetaMaskConnectionDrawer } from './MetaMaskConnectionDrawer';

const meta: Meta<typeof MetaMaskConnectionDrawer> = {
    title: 'Molecules/MetaMaskConnectionDrawer',
    component: MetaMaskConnectionDrawer,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <I18nextProvider i18n={i18n}>
                <div style={{ padding: '20px' }}>
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

type Story = StoryObj<typeof MetaMaskConnectionDrawer>;

export const Default: Story = {
    render: () => {
        const [open, setOpen] = useState(true);

        return (
            <MetaMaskConnectionDrawer
                open={open}
                onClose={() => {
                    setOpen(false);
                }}
                onCancel={() => {
                    setOpen(false);
                }}
            />
        );
    },

// ⛔️ Временно отключено (в будущем требуется дописать тесты для данного компонента):
// play: async ({ canvasElement }) => {
// const canvas = within(canvasElement);
// const title = await canvas.findByTestId('metamask-drawer-title');
// expect(title).toBeInTheDocument();
// },
};