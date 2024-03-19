import { defineConfig } from 'vite'
import vercel from 'vite-plugin-vercel'

export default defineConfig({
  plugins: [vercel()],
  vercel: {
    // optional configuration options, see "Advanced usage" below for details
  },
})