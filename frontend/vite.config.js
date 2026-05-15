import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Typer iframe is same-origin as the Vite app; POST /api/typing/log must reach the backend.
      "/api": {
        target: process.env.VITE_DEV_API_PROXY ?? "http://127.0.0.1:5001",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq, req) => {
            const existing = req.headers["x-forwarded-for"];
            const peer = req.socket?.remoteAddress?.replace(/^::ffff:/, "") || "";
            if (peer) {
              proxyReq.setHeader(
                "x-forwarded-for",
                existing ? `${existing}, ${peer}` : peer,
              );
            }
          });
        },
      },
    },
  },
  preview: {
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API_PROXY ?? "http://127.0.0.1:5001",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq, req) => {
            const existing = req.headers["x-forwarded-for"];
            const peer = req.socket?.remoteAddress?.replace(/^::ffff:/, "") || "";
            if (peer) {
              proxyReq.setHeader(
                "x-forwarded-for",
                existing ? `${existing}, ${peer}` : peer,
              );
            }
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
