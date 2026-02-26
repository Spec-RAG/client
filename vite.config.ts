import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://52.79.143.219",
        changeOrigin: true,
        secure: false,
        // 로그용
        configure: (proxy) => {
          proxy.on("error", (err) => console.log("proxy error", err));
          proxy.on("proxyReq", (proxyReq, req) =>
            console.log("proxyReq", req.method, req.url),
          );
          proxy.on("proxyRes", (proxyRes, req) =>
            console.log("proxyRes", proxyRes.statusCode, req.url),
          );
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
