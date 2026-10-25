import { LitElement } from 'lit';
import { describe, expect, it } from 'vitest';
import { defineOnce, mount } from '../../test/utils.js';
import { TypeaheadController } from './typeahead.js';

class TypeaheadHost extends LitElement {
  current: HTMLElement | null = null;
  typeahead = new TypeaheadController(this, {
    items: () => [...this.querySelectorAll<HTMLElement>('li')],
    onMatch: (item) => (this.current = item),
    timeout: 100,
  });

  /** Simulates a keydown and returns whether the typeahead handled it. */
  press(key: string, init: KeyboardEventInit = {}): boolean {
    const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init });
    const handled = this.typeahead.handleKeyDown(event, this.current);
    expect(event.defaultPrevented).toBe(handled);
    return handled;
  }
}

defineOnce('t-typeahead', TypeaheadHost);

async function setup() {
  const root = await mount(`
    <t-typeahead>
      <li>Apple</li>
      <li>Banana</li>
      <li aria-disabled="true">Blackberry</li>
      <li>Blueberry</li>
      <li aria-label="Cherry">🍒</li>
      <li>Éclair</li>
    </t-typeahead>
  `);
  return root.querySelector<TypeaheadHost>('t-typeahead')!;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('TypeaheadController', () => {
  it('jumps to the next item starting with a character, case-insensitively', async () => {
    const host = await setup();
    expect(host.press('B')).toBe(true);
    expect(host.current?.textContent).toBe('Banana');
  });

  it('cycles through matches when the same character repeats, skipping disabled items', async () => {
    const host = await setup();
    host.press('b');
    host.press('b');
    expect(host.current?.textContent).toBe('Blueberry');
    host.press('b');
    expect(host.current?.textContent).toBe('Banana');
  });

  it('matches a typed string, then resets after the timeout', async () => {
    const host = await setup();
    host.press('b');
    host.press('l');
    expect(host.current?.textContent).toBe('Blueberry');

    await wait(150);
    host.press('a');
    expect(host.current?.textContent).toBe('Apple');
  });

  it('uses aria-label and non-ASCII characters', async () => {
    const host = await setup();
    host.press('c');
    expect(host.current?.getAttribute('aria-label')).toBe('Cherry');
    host.typeahead.reset();
    host.press('é');
    expect(host.current?.textContent).toBe('Éclair');
  });

  it('includes spaces only inside a typed string', async () => {
    const host = await setup();
    expect(host.press(' ')).toBe(false);
  });

  it('ignores modifier shortcuts, named keys, and characters with no match', async () => {
    const host = await setup();
    expect(host.press('a', { ctrlKey: true })).toBe(false);
    expect(host.press('a', { metaKey: true })).toBe(false);
    expect(host.press('ArrowDown')).toBe(false);
    expect(host.press('z')).toBe(false);
    expect(host.current).toBeNull();
  });
});
