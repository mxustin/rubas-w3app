// Визуальный компонент-организм AppShell (заголовок главного окна приложения)

/**
 * Организм: AppShell - адаптивный интерфейс приложения, который включает в себя: заголовок (header), навигационную
 *   панель (navbar), боковую панель (aside) и подвал (footer).
 * @module
 */

import { AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

function BaseLayout() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            <AppShell.Header>
                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="sm"
                    size="sm"
                />
                <div>Logo</div>
            </AppShell.Header>

            <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

            <AppShell.Main>Main</AppShell.Main>
        </AppShell>
    );
}

export default BaseLayout;