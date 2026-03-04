import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 3000,
    proxy: {
      "/employees": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
    // 🔥 KEY PART: This fixes frontend routing in dev for React Router
    historyApiFallback: true,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          icons: ['lucide-react'],
          charts: ['chart.js', 'recharts'],
        },
      },
    },
  },
}));
