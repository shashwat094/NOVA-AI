import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // `vercel dev` (or any local API server) can serve /api/chat on :3000.
    // In plain `npm run dev` the proxy simply fails and the UI shows a clean
    // error instead of crashing.
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});