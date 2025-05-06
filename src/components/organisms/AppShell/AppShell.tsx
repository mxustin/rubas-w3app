// Визуальный компонент-организм AppShell<br> (заголовок главного окна приложения)

/**
 * Организм: AppShell - адаптивный интерфейс приложения, который включает в себя: заголовок (header), навигационную
 *   панель (navbar), боковую панель (aside) и подвал (footer).
 * @module
 */

import { AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import './AppShell.module.scss';

import { ConnectWalletButton } from "../../atoms/Buttons/ConnectWalletButton/ConnectWalletButton.tsx";

export const AppShell: React.FC = () => {
    const [opened, { toggle }] = useDisclosure();

    return (
        <MantineAppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            <MantineAppShell.Header>
                <ConnectWalletButton />
            </MantineAppShell.Header>

            <MantineAppShell.Navbar p="md">Navbar</MantineAppShell.Navbar>

            <MantineAppShell.Main>Main</MantineAppShell.Main>
        </MantineAppShell>
    );
};