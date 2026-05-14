import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    splitVendorChunkPlugin(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

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
    // Modern browsers = no legacy polyfills
    target: ['es2020', 'chrome87', 'firefox78', 'safari14'],
    minify: 'esbuild',
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    cssMinify: 'esbuild',

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) return 'react-vendor'

          if (
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/@remix-run/router')
          ) return 'router-vendor'

          if (id.includes('node_modules/react-icons/')) return 'icons-vendor'
          if (id.includes('node_modules/react-hot-toast/')) return 'toast-vendor'
          if (id.includes('node_modules/axios/')) return 'http-vendor'

          if (id.includes('/pages/admin/')) return 'admin-pages'

          if (
            id.includes('/pages/ShippingPolicy') ||
            id.includes('/pages/ReturnPolicy') ||
            id.includes('/pages/PrivacyPolicy') ||
            id.includes('/pages/Terms') ||
            id.includes('/pages/Contact') ||
            id.includes('/pages/FAQ')
          ) return 'policy-pages'
        },

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop()
          if (/png|jpe?g|svg|gif|webp|avif/.test(ext)) return 'assets/images/[name]-[hash][extname]'
          if (ext === 'css') return 'assets/css/[name]-[hash][extname]'
          return 'assets/[name]-[hash][extname]'
        },
      },

      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },

  css: {
    devSourcemap: false,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'react-hot-toast'],
  },

  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },
})
