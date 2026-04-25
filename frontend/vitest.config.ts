import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Tests inject NEXT_PUBLIC_API_URL via setup; lib/env throws otherwise.
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:4000/api',
    },
  },
});
