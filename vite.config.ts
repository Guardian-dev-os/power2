import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    middlewareMode: false,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.vercel.app',
      '.vercel.run',
      'sb-5pzqeipghge7.vercel.run',
    ],
  },
  build: {
    target: 'esnext',
    minify: 'terser',
  },
})
