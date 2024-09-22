import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 8000
  },
  preview: {
    port: 8000
  },
  plugins: [svelte()],
  resolve: {
    alias: {
      $src: '/src'
    }
  }
})
