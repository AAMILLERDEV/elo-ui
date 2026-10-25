import { describe, expect, it } from 'vitest';
import { composedContains, getDeepActiveElement, getTabbableElements } from './dom.js';
import { mount, shadowHost } from '../test/utils.js';

const ids = (els: Element[]) => els.map((el) => el.id);

describe('getDeepActiveElement', () => {
  it('descends through nested shadow roots', async () => {
    const inner = shadowHost('t-dom-inner', '<button id="deep">Deep</button>');
    const outer = shadowHost('t-dom-outer', `<${inner}></${inner}>`);
    const root = await mount(`<${outer}></${outer}>`);

    const deep = root
      .querySelector(outer)!
      .shadowRoot!.querySelector(inner)!
      .shadowRoot!.querySelector<HTMLButtonElement>('#deep')!;
    deep.focus();

    expect(document.activeElement).toBe(root.querySelector(outer));
    expect(getDeepActiveElement()).toBe(deep);
  });
});

describe('getTabbableElements', () => {
  it('returns light DOM tabbables in order and skips non-tabbable ones', async () => {
    const root = await mount(`
      <button id="a">A</button>
      <a id="no-href">Not a link</a>
      <a id="link" href="#x">Link</a>
      <button id="disabled" disabled>Disabled</button>
      <div id="neg" tabindex="-1">Programmatic only</div>
      <div id="zero" tabindex="0">Tabbable div</div>
      <button id="hidden" style="display: none">Hidden</button>
      <button id="invisible" style="visibility: hidden">Invisible</button>
      <div inert><button id="inert">Inert</button></div>
      <input id="text" />
      <input id="hidden-input" type="hidden" />
      <fieldset disabled><input id="in-disabled-fieldset" /></fieldset>
    `);
    expect(ids(getTabbableElements(root))).toEqual(['a', 'link', 'zero', 'text']);
  });

  it('includes shadow DOM content and slotted children in flat-tree order', async () => {
    const tag = shadowHost(
      't-dom-slots',
      '<button id="s1">S1</button><slot></slot><button id="s2">S2</button>',
    );
    const root = await mount(`
      <button id="before">Before</button>
      <${tag}><button id="light">Light</button></${tag}>
      <button id="after">After</button>
    `);
    expect(ids(getTabbableElements(root))).toEqual(['before', 's1', 'light', 's2', 'after']);
  });

  it('uses slot fallback content when nothing is assigned', async () => {
    const tag = shadowHost(
      't-dom-fallback',
      '<slot><button id="fallback">Fallback</button></slot>',
    );
    const root = await mount(`<${tag}></${tag}>`);
    expect(ids(getTabbableElements(root))).toEqual(['fallback']);
  });

  it('skips content inside an inert shadow host', async () => {
    const tag = shadowHost('t-dom-inert-host', '<button id="inside">Inside</button>');
    const root = await mount(`<${tag} inert></${tag}><button id="outside">Outside</button>`);
    expect(ids(getTabbableElements(root))).toEqual(['outside']);
  });

  it('accepts a shadow root as the root', async () => {
    const tag = shadowHost('t-dom-root', '<button id="x">X</button><button id="y">Y</button>');
    const root = await mount(`<${tag}></${tag}>`);
    expect(ids(getTabbableElements(root.querySelector(tag)!.shadowRoot!))).toEqual(['x', 'y']);
  });
});

describe('composedContains', () => {
  it('follows slot assignment and shadow hosts', async () => {
    const tag = shadowHost('t-dom-contains', '<div class="panel"><slot></slot></div>');
    const root = await mount(`<${tag}><button id="slotted">Slotted</button></${tag}>`);
    const host = root.querySelector(tag)!;
    const panel = host.shadowRoot!.querySelector('.panel')!;
    const slotted = root.querySelector('#slotted')!;

    expect(composedContains(panel, slotted)).toBe(true);
    expect(composedContains(root, panel)).toBe(true);
    expect(composedContains(panel, root)).toBe(false);
    expect(composedContains(panel, null)).toBe(false);
  });
});
