import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/algo-visualizer/',
  server: {
    port: 5173,
  },
})
