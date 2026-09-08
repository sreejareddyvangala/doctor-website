import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

import { areaAnalysisApi } from './server/vite-plugin';

export default defineConfig({
  // `areaAnalysisApi` serves /api/area-analysis in `vite dev` and `vite preview`.
  plugins: [react(), areaAnalysisApi()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
