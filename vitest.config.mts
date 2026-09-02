// vitest.config.mts

import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // 👈 只匹配 lib 目录下的纯逻辑单元测试
    include: ['lib/**/*.test.{ts,tsx}'],
    // 👈 明确排除组件测试文件
    exclude: ['tests/**/*.component.test.{ts,tsx}', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});