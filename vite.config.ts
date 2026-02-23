import path from 'path';
import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true
    }),
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/api/twitter': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/api': {
        target: 'https://pawx-social-assistant.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
        timeout: 60000,
      },
      '/ws': {
        target: 'wss://pawx-social-assistant.onrender.com',
        changeOrigin: true,
        ws: true,
        secure: true,
      },
    },
  },
});
