import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/dev/',
  plugins: [react()],
  server: {
    allowedHosts: ['12.yvelin.net'],
    fs: {
      allow: ['.', '../interfaces'],
    },
    hmr: {
      host: '12.yvelin.net',
      protocol: 'wss',
    },
  },
});
