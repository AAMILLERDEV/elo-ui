import { describe, expect, it } from 'vitest';
import { hasDecorators, transpileDecorators, tsDecorators } from './vite-ts-decorators.js';

const decorated = `
function track(value: unknown, context: ClassAccessorDecoratorContext) {
  context.addInitializer(function (this: any) { this.tracked = String(context.name); });
  return value as any;
}

export class Counter {
  @track accessor count: number = 1;
}
`;

/** Runs transpiled ESM and returns its exports. */
async function evaluate(code) {
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

describe('hasDecorators', () => {
  it.each([
    ['@property() accessor label = "";', true],
    ['  @state() private accessor open = false;', true],
    ['@customElement("x-a")\nclass A {}', true],
    ['  @query("#x")\n  accessor el;', true],
    ['  @track accessor count = 1;', true],
  ])('detects %j', (code, expected) => {
    expect(hasDecorators(code)).toBe(expected);
  });

  it.each([
    '/**\n * @slot - The label.\n * @csspart base - The control.\n */',
    'const email = "team@example.com";',
    "import { css } from 'lit';",
    'const styles = css`@media (forced-colors: active) { a { color: red; } }`;',
    'const styles = css`\n  @property --x { syntax: "<length>"; }\n  @keyframes spin {}\n`;',
  ])('ignores %j', (code) => {
    expect(hasDecorators(code)).toBe(false);
  });
});

describe('transpileDecorators', () => {
  it('lowers standard decorators into runnable code', async () => {
    const { code } = transpileDecorators(decorated, 'counter.ts');
    expect(code).not.toMatch(/^\s*@track/m);

    const { Counter } = await evaluate(code);
    const counter = new Counter();
    expect(counter.count).toBe(1);
    expect(counter.tracked).toBe('count');
  });

  it('emits a source map', () => {
    const { map } = transpileDecorators(decorated, 'counter.ts');
    expect(map?.sources).toEqual(['counter.ts']);
  });
});

describe('tsDecorators plugin', () => {
  const transform = (code, id) => tsDecorators().transform.call({}, code, id);

  it('runs before Vite core transforms', () => {
    expect(tsDecorators().enforce).toBe('pre');
  });

  it('transforms TypeScript files that use decorators', () => {
    expect(transform(decorated, '/repo/src/counter.ts')?.code).not.toMatch(/^\s*@track/m);
    expect(transform(decorated, '/repo/src/counter.ts?v=123')).not.toBeNull();
  });

  it('skips files without decorators, non-TS files, and node_modules', () => {
    expect(transform('export const a = 1;', '/repo/src/a.ts')).toBeNull();
    expect(transform(decorated, '/repo/src/counter.js')).toBeNull();
    expect(transform(decorated, '/repo/node_modules/pkg/counter.ts')).toBeNull();
  });
});
