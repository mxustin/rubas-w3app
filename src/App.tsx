// Корневой компонент "Приложение" (App)

/**
 * Корневой компонент приложения
 * @component
 * @example
 * <App />
 */

import './App.scss'
import { AppShell } from './components/organisms/AppShell/AppShell';

function App() {

  return (
    <>
        <AppShell />
    </>
  )
}

export default App
