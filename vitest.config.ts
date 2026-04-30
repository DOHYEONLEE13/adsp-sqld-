/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node', // 머지 함수는 순수 — DOM 불필요
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    globals: false, // 명시적 import (it / expect 등) 강제 — 안전
  },
});
