
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {},
    // Copy _redirects to dist after build for Netlify
    async writeBundle() {
      const src = resolve(__dirname, '_redirects');
      const dest = resolve(__dirname, 'dist/_redirects');
      if (existsSync(src)) {
        copyFileSync(src, dest);
      }
    }
  }
})
