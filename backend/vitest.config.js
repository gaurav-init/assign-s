import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    setupFiles: ['./vitest.setup.js'],
    include: ['src/**/*.test.js'],
    reporters: 'default',
  },
});
