// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Split vendor chunks for better caching
      output: {
        manualChunks: {
          "react-vendor":   ["react", "react-dom"],
          "query-vendor":   ["@tanstack/react-query"],
          "zustand-vendor": ["zustand"],
          "jose-vendor":    ["jose"],
          "zod-vendor":     ["zod"],
        },
      },
    },
  },
  server: {
    proxy: {
      // Dev: proxy /api/* to Vercel dev server
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
