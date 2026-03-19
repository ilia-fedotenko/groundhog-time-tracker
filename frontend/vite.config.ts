import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@groundhog/ui': fileURLToPath(new URL('../packages/ui/src', import.meta.url)),
      '@/': fileURLToPath(new URL('../packages/ui/src/', import.meta.url)),
    },
  },
})
