// Файл конфигурации Vite, определяющий параметры сборки для проекта

import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
{ find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  }
})
