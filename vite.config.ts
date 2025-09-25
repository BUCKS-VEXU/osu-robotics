import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true, xfwd: true },
      '/auth': { target: 'http://localhost:3000', changeOrigin: true, xfwd: true },
    },
  },
  resolve: { alias: { $fonts: resolve('./static/fonts') } },
});
