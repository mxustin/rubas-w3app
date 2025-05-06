// Визуальный компонент-организм AppShell<br> (заголовок главного окна приложения)

/**
 * Организм: AppShell - адаптивный интерфейс приложения, который включает в себя: заголовок (header), навигационную
 *   панель (navbar), боковую панель (aside) и подвал (footer).
 * @module
 */

import { AppShell as MantineAppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import './AppShell.scss';

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
                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="sm"
                    size="sm"
                />
                <div>Logo</div>
            </MantineAppShell.Header>

            <MantineAppShell.Navbar p="md">Navbar</MantineAppShell.Navbar>

            <MantineAppShell.Main>Main</MantineAppShell.Main>
        </MantineAppShell>
    );
};