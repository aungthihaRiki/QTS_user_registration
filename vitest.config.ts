import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      '**/*.test.ts',    // pick up all test files anywhere
      '**/*.test.tsx'    // if you also test React components
    ],
  },
});
