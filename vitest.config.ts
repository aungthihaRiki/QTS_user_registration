import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: [
      '**/*.test.ts',    // pick up all test files anywhere
      '**/*.test.tsx'    // if you also test React components
    ],
  },
});
