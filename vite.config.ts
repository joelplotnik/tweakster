import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs'

import ReactPlugin from '@vitejs/plugin-react'
import RubyPlugin from 'vite-plugin-ruby'
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [RubyPlugin(), ReactPlugin()],
  // add new alias for each folder that exists in your `app/javascript` folder
  resolve: {
    alias: {
      src: resolve(__dirname, 'app/javascript/src'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildCommonjs(['react-moment'])],
    },
  },
})
