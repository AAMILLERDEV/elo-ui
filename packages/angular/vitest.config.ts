import { defineConfig } from 'vitest/config';
import { browserTest } from '@elo-ui/build-tools/vitest';

export default defineConfig({
  // Angular uses legacy (experimental) decorators; tests compile directives JIT.
  oxc: { decorator: { legacy: true } },
  ...browserTest({ port: 63405, include: ['src/**/*.test.ts'], depsFrom: '@elo-ui/components' }),
});
