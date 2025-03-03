import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    target: 'es2015',
    lib: {
      entry: 'src/webflow-embed.js',
      name: 'QofCalculator',
      formats: ['iife'],
      fileName: 'qof-calculator'
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    copyPublicDir: true
  },
  publicDir: 'public',
  assetsInclude: ['**/*.csv']
}); 