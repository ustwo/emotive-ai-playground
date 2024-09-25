import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        share: resolve(__dirname, "sharecard/index.html"),
        llmtest: resolve(__dirname, "llm-test.html"),
        radialtest: resolve(__dirname, "radial-interface-test.html"),
      },
    },
  },
  server: {
    host: true,
  },
});
