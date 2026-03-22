import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/__tests__/__mocks__/foundry-globals.ts'],
    alias: {
      'virtual:harbinger-markdown': new URL('./src/__tests__/__mocks__/virtual-markdown.ts', import.meta.url).pathname,
    },
  },
});
