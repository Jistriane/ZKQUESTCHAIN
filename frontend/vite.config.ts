import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ZKQUESTCHAIN/',
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: false,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis'
      },
    },
    exclude: ['@noir-lang/noir_js', '@noir-lang/backend_barretenberg', '@aztec/bb.js'],
  },
  define: {
    'global': 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
    },
  },
  server: {
    port: 5175,
    fs: {
      allow: ['..']
    }
  },
  assetsInclude: ['**/*.wasm'],
});
