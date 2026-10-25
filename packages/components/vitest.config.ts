import { defineConfig } from 'vitest/config';
import { tsDecorators } from '@elo-ui/build-tools/vite';
import { browserTest } from '@elo-ui/build-tools/vitest';

export default defineConfig({
  plugins: [tsDecorators()],
  ...browserTest({ port: 63402, include: ['src/**/*.test.ts'] }),
});
