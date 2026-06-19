import { fileURLToPath, URL } from 'node:url';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';

const mcAssets = fileURLToPath(new URL('./vendors/minecraft', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    svgr(),
  ],
  resolve: {
    alias: {
      '@mc': mcAssets,
    },
  },
  server: {
    port: 27021,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },
});
