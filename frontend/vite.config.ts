import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-getsong': {
        target: 'https://api.getsong.co',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-getsong/, '')
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
