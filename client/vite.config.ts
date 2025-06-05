import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
    },
  },
  server: {
    port: 5173,
    host: true, // allow external access
    allowedHosts: [
      '3ed5-102-97-19-78.ngrok-free.app' // <-- add your ngrok tunnel here
    ],
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
