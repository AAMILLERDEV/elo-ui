import { defineConfig } from 'vitest/config';
import { browserTest } from '@elo-ui/build-tools/vitest';

export default defineConfig({
  ...browserTest({ port: 63403, include: ['src/**/*.test.tsx'], litFrom: '@elo-ui/components' }),
});
