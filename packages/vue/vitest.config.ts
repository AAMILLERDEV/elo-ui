import { defineConfig } from 'vitest/config';
import { browserTest } from '@elo-ui/build-tools/vitest';

export default defineConfig({
  resolve: {
    // The full build includes the runtime template compiler used in tests.
    alias: { vue: 'vue/dist/vue.esm-bundler.js' },
  },
  define: {
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  test: browserTest({ port: 63404, include: ['src/**/*.test.ts'] }),
});
