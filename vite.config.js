import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // Base path ensures production works correctly even in subfolders
  base: "/",

  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
    splitVendorChunkPlugin(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  build: {
    target: ["es2020", "chrome87", "firefox78", "safari14"],
    minify: "esbuild",
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    cssMinify: "esbuild",

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          )
            return "react-vendor";

          if (
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@remix-run/router")
          )
            return "router-vendor";

          if (id.includes("node_modules/react-icons/")) return "icons-vendor";
          if (id.includes("node_modules/react-hot-toast/"))
            return "toast-vendor";
          if (id.includes("node_modules/axios/")) return "http-vendor";

          // REMOVE page chunking! Let Vite handle it automatically
        },
      },
    },
  },

  css: {
    devSourcemap: false,
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "axios",
      "react-hot-toast",
    ],
  },

  esbuild: {
    // Drops console/debugger in production to reduce bundle size
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    legalComments: "none",
  },
});
