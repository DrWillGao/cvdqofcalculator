import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const isLibBuild = process.env.BUILD_MODE === 'lib';

  const baseConfig = {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: true
    },
    base: './',
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
          name: 'QofCalculatorLib',
          formats: ['iife'],
          fileName: 'qof-calculator'
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            },
            extend: true,
            inlineDynamicImports: true,
            name: 'QofCalculatorLib',
            format: 'iife',
            exports: 'named'
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