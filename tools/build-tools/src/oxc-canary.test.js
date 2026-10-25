import { transformWithOxc } from 'vite';
import { expect, it } from 'vitest';

/**
 * Canary: Vite's Oxc transformer currently leaves standard decorators untouched, which is
 * why `tsDecorators()` exists. When this test fails, Oxc lowers them itself: delete the
 * plugin (and this test) and drop it from every vitest/astro config.
 */
it('Oxc still does not lower standard decorators (tsDecorators plugin is still needed)', async () => {
  const { code } = await transformWithOxc(
    'function d(v: unknown) { return v as any; }\nexport class A { @d accessor x = 1; }',
    'canary.ts',
    { target: 'es2022' },
  );
  expect(
    code,
    'Oxc now lowers standard decorators. Remove @elo-ui/build-tools tsDecorators().',
  ).toMatch(/@d\s+accessor/);
});
