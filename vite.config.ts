import ReactPlugin from '@vitejs/plugin-react'
import RubyPlugin from 'vite-plugin-ruby'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    RubyPlugin(),
    ReactPlugin()
  ],
})
