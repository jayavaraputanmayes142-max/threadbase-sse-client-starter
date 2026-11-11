import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// EventSource cannot send an Authorization header, and the server only
// accepts "Authorization: Bearer <token>". In dev, Vite proxies /api to the
// Express server and turns the tb_token cookie (set on login) into that header.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            const match = /(?:^|;\s*)tb_token=([^;]+)/.exec(req.headers.cookie ?? "");
            if (match && !req.headers.authorization) {
              proxyReq.setHeader("Authorization", `Bearer ${decodeURIComponent(match[1])}`);
            }
          });
        },
      },
    },
  },
});