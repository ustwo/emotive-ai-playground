import { defineConfig } from "vite"
import { resolve } from "path"
import vercel from "vite-plugin-vercel"

export default defineConfig({
  plugins: [vercel()],
  vercel: {
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        share: resolve(__dirname, "/sharecard.html"),
        llmtest: resolve(__dirname, "/llm-test.html"),
        radialtest: resolve(__dirname, "radial-interface-test.html")
      }
    }
  },
  server: {
    host: true
  }
})