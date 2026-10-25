import { defineConfig } from 'vitest/config';
import { browserTest } from '@elo-ui/build-tools/vitest';

export default defineConfig({
  ...browserTest({ port: 63401, include: ['src/**/*.test.ts'] }),
});
