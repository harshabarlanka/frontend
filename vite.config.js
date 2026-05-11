import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',

    // Enable minification
    minify: 'esbuild',

    // Raise chunk warning limit slightly
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching & smaller initial bundles
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-vendor': ['react-hot-toast', 'react-icons'],
        },
      },
    },

    // Generate source maps for production error tracking (set to false to disable)
    sourcemap: false,

    // Compress assets
    assetsInlineLimit: 4096,
  },

  // Enable CSS code splitting
  css: {
    devSourcemap: false,
  },
})
