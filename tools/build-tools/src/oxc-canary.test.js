import { transformWithOxc } from 'vite';
import { expect, it } from 'vitest';

// When this fails, Oxc lowers decorators itself: delete tsDecorators() and this test.
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
