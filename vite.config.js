import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Expense-Tracker/',
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
