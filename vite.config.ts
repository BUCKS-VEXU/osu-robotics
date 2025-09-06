import react from '@vitejs/plugin-react'
import {resolve} from 'path';
import {defineConfig} from 'vite'
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  // depending on your application, base can also be "/"
  base: '',
  plugins: [react(), viteTsconfigPaths()],
  server: {
    host: true,  // so LAN/devices can hit it if needed
    port: 5173,
    proxy: {
      '/api': {target: 'http://localhost:3000', changeOrigin: true, xfwd: true},
      '/auth':
          {target: 'http://localhost:3000', changeOrigin: true, xfwd: true},
    },
  },
  resolve: {alias: {$fonts: resolve('./static/fonts')}},
})
