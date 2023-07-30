import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: true,
    port: 3000,
    hmr: {
      overlay: false,
    }
  },
  plugins: [
    vue(),
    mkcert(),
  ]
})
