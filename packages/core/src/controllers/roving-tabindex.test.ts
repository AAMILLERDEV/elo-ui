import { LitElement, html } from 'lit';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { defineOnce, mount } from '../../test/utils.js';
import { RovingTabindexController, type RovingTabindexOptions } from './roving-tabindex.js';

function rovingHost(options: Partial<RovingTabindexOptions> = {}) {
  return class RovingHost extends LitElement {
    onActiveChange = vi.fn();
    roving = new RovingTabindexController(this, {
      items: () => [...this.querySelectorAll<HTMLElement>('[data-item]')],
      orientation: 'horizontal',
      onActiveChange: (item) => this.onActiveChange(item),
      ...options,
    });

    override render() {
      return html`<slot></slot>`;
    }
  };
}
type RovingHost = InstanceType<ReturnType<typeof rovingHost>>;

defineOnce('t-roving', rovingHost());
defineOnce('t-roving-nowrap', rovingHost({ wrap: false }));

const items = `
  <button data-item id="a">A</button>
  <button data-item id="b">B</button>
  <button data-item id="c" aria-disabled="true">C</button>
  <button data-item id="d">D</button>
`;

async function setup(attrs = '', tag = 't-roving') {
  const root = await mount(`
    <button id="before">Before</button>
    <${tag} ${attrs}>${items}</${tag}>
    <button id="after">After</button>
  `);
  const host = root.querySelector<RovingHost>(tag)!;
  const tabIndexes = () =>
    [...host.querySelectorAll<HTMLElement>('[data-item]')].map((el) => el.tabIndex);
  return { root, host, tabIndexes };
}

const focusedId = () => document.activeElement?.id;

describe('RovingTabindexController', () => {
  it('makes the first enabled item the only Tab stop', async () => {
    const { tabIndexes } = await setup();
    expect(tabIndexes()).toEqual([0, -1, -1, -1]);

    await userEvent.click(document.querySelector('#before')!);
    await userEvent.tab();
    expect(focusedId()).toBe('a');
    await userEvent.tab();
    expect(focusedId()).toBe('after');
  });

  it('moves with arrows, skips disabled items, and wraps', async () => {
    const { host, tabIndexes } = await setup();
    host.querySelector<HTMLElement>('#a')!.focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(focusedId()).toBe('b');
    await userEvent.keyboard('{ArrowRight}');
    expect(focusedId()).toBe('d');
    expect(tabIndexes()).toEqual([-1, -1, -1, 0]);
    await userEvent.keyboard('{ArrowRight}');
    expect(focusedId()).toBe('a');
    await userEvent.keyboard('{ArrowLeft}');
    expect(focusedId()).toBe('d');
    expect(host.onActiveChange).toHaveBeenLastCalledWith(host.querySelector('#d'));
  });

  it('supports Home and End', async () => {
    const { host } = await setup();
    host.querySelector<HTMLElement>('#b')!.focus();

    await userEvent.keyboard('{End}');
    expect(focusedId()).toBe('d');
    await userEvent.keyboard('{Home}');
    expect(focusedId()).toBe('a');
  });

  it('ignores vertical arrows in horizontal orientation', async () => {
    const { host } = await setup();
    host.querySelector<HTMLElement>('#a')!.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(focusedId()).toBe('a');
  });

  it('flips horizontal arrows in RTL', async () => {
    const { host } = await setup('dir="rtl"');
    host.querySelector<HTMLElement>('#a')!.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(focusedId()).toBe('b');
  });

  it('stops at the ends when wrap is false', async () => {
    const { host } = await setup('', 't-roving-nowrap');
    host.querySelector<HTMLElement>('#d')!.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focusedId()).toBe('d');
  });

  it('makes a clicked item the Tab stop', async () => {
    const { host, tabIndexes } = await setup();
    await userEvent.click(host.querySelector('#b')!);
    expect(tabIndexes()).toEqual([-1, 0, -1, -1]);
  });

  it('re-syncs when the active item is removed', async () => {
    const { host, tabIndexes } = await setup();
    host.roving.setActiveItem(host.querySelector('#b')!);
    host.querySelector('#b')!.remove();
    host.roving.sync();
    expect(host.roving.activeItem?.id).toBe('a');
    expect(tabIndexes()).toEqual([0, -1, -1]);
  });
});
