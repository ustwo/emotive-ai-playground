import { defineConfig } from "vite"
import { resolve } from "path"
import vercel from "vite-plugin-vercel"

export default defineConfig({
  plugins: [vercel()],
  vercel: {
    // optional configuration options, see "Advanced usage" below for details
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        llmtest: resolve(__dirname, "llm-test.html"),
        radialtest: resolve(__dirname, "radial-interface-test.html")
      }
    }
  },
  server: {
    host: true
  }
})