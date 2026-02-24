import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isWidget = mode === 'widget';
  
  return {
    plugins: [
      react(),
      dts({
        include: ['src/**/*'],
        exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      }),
    ],
    build: isWidget ? {
      // Library build for npm package
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'AvalancheDexWidget',
        formats: ['es', 'cjs', 'umd'],
        fileName: (format) => `index.${format}.js`,
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
      cssCodeSplit: false,
    } : {
      // Demo app build
      outDir: 'dist-demo',
    },
    css: {
      postcss: './postcss.config.js',
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  };
});