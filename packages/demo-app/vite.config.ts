import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias the widget package to its source files instead of dist/ for Vercel builds
      '@snowmonster_defi/widget': path.resolve(__dirname, '../widget/src/index.ts')
    }
  },
  server: {
    port: 5173,
    open: true,
    fs: {
      allow: ['..']
    }
  }
})