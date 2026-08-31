import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 環境変数に応じてポーリング監視を有効化（CHOKIDAR_USEPOLLING, USE_POLLING, VITE_USE_POLLING）
const usePolling =
  process.env.CHOKIDAR_USEPOLLING === "true" ||
  process.env.USE_POLLING === "true" ||
  process.env.VITE_USE_POLLING === "true";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling,
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});
