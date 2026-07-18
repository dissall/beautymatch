import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/face-api.js')) return 'faceapi'
          if (id.includes('node_modules/recharts')) return 'charts'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
