import { defineConfig } from 'vite'
import { resolve } from 'path';
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  // depending on your application, base can also be "/"
  base: '',
  plugins: [react(), viteTsconfigPaths()],
  server: {
    host: true,  // so LAN/devices can hit it if needed
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',  // your Express server
    },
  },
  resolve: {alias: {$fonts: resolve('./static/fonts')}},
})
