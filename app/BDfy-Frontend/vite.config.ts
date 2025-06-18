import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    host: '127.0.0.1',
    port: 5016,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5015',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});