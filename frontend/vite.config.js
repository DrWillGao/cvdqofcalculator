import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const isLibBuild = process.env.BUILD_MODE === 'lib';

  const baseConfig = {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/data': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false
        },
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false
        }
      }
    },
    base: '/',
    publicDir: 'public',
    assetsInclude: ['**/*.csv']
  };

  if (isLibBuild) {
    return {
      ...baseConfig,
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        minify: 'terser',
        target: 'es2015',
        lib: {
          entry: 'src/webflow-embed.jsx',
          name: 'QofCalculatorNamespace',
          formats: ['iife'],
          fileName: (format) => `qof-calculator.${format}.js`
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'prop-types'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'prop-types': 'PropTypes'
            },
            extend: true,
            inlineDynamicImports: true,
            name: 'QofCalculatorNamespace',
            format: 'iife',
            exports: 'named',
            assetFileNames: (assetInfo) => {
              if (assetInfo.name.endsWith('.js')) {
                return 'qof-calculator.iife.js';
              }
              return `assets/[name]-[hash][extname]`;
            }
          }
        },
        copyPublicDir: true
      }
    };
  }

  // Default web build configuration
  return {
    ...baseConfig,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      minify: 'terser',
      target: 'es2015',
      copyPublicDir: true
    }
  };
}); 