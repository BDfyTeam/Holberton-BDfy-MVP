import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: '127.0.0.1',   // Dirección IP local
    port: 5016,          // Puerto del frontend
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5015', // Puerto del backend (si te da error lo cambie a 5015 - Lucas :DDDDDDDDDDDDDDDDDDDDDDD)
        changeOrigin: true,
        secure: false,
      }
    }
  }
});