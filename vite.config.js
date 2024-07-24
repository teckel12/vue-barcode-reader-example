import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'

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
    basicSsl(),
  ],
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
  },
})
