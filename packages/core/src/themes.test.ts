import { afterEach, describe, expect, it } from 'vitest';
import baseCss from '../theme.css?raw';
import warmCss from '../themes/warm.css?raw';

// Color pairs every theme must keep legible: [foreground token, background token, minimum ratio].
const PAIRS: [string, string, number][] = [
  ['fg', 'bg', 4.5],
  ['fg', 'surface', 4.5],
  ['fg-muted', 'surface', 4.5],
  ['fg-muted', 'bg', 4.5],
  ['accent-fg', 'accent', 4.5],
  ['accent-fg', 'accent-hover', 4.5],
  ['accent-text', 'surface', 4.5],
  ['danger-fg', 'danger', 4.5],
  ['danger-text', 'surface', 4.5],
  ['inverse-fg', 'inverse-bg', 4.5],
  ['border-control', 'surface', 3],
  ['focus-ring', 'surface', 3],
  ['focus-ring', 'bg', 3],
  ...['info', 'success', 'warning', 'danger', 'neutral'].map(
    (v) => [`${v}-soft-fg`, `${v}-soft-bg`, 4.5] as [string, string, number],
  ),
];

const styles: HTMLStyleElement[] = [];
afterEach(() => styles.splice(0).forEach((s) => s.remove()));

function load(...css: string[]) {
  for (const text of css) {
    const style = document.createElement('style');
    style.textContent = text;
    document.head.append(style);
    styles.push(style);
  }
}

// Resolves a token to sRGB by letting the browser compute it as a color.
function rgb(token: string, scope: HTMLElement): [number, number, number] {
  const probe = document.createElement('span');
  probe.style.color = `var(--elo-color-${token})`;
  scope.append(probe);
  const [r, g, b] = getComputedStyle(probe)
    .color.match(/[\d.]+/g)!
    .map(Number);
  probe.remove();
  return [r!, g!, b!];
}

function luminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const themes = { default: [baseCss], warm: [baseCss, warmCss] };

describe('theme contrast (WCAG AA)', () => {
  for (const [name, css] of Object.entries(themes)) {
    for (const mode of ['light', 'dark'] as const) {
      it(`${name} ${mode}`, () => {
        load(...css);
        const scope = document.createElement('div');
        scope.dataset.eloTheme = mode;
        document.body.append(scope);
        const failures = PAIRS.map(([fg, bg, min]) => ({
          pair: `${fg} on ${bg}`,
          ratio: Math.round(contrast(rgb(fg, scope), rgb(bg, scope)) * 100) / 100,
          min,
        })).filter(({ ratio, min }) => ratio < min);
        scope.remove();
        expect(failures).toEqual([]);
      });
    }
  }

  it('warm actually changes the look', () => {
    load(baseCss);
    const before = rgb('accent', document.body).join();
    load(warmCss);
    expect(rgb('accent', document.body).join()).not.toBe(before);
    expect(
      getComputedStyle(document.documentElement).getPropertyValue('--elo-radius-md').trim(),
    ).toBe('10px');
  });
});
