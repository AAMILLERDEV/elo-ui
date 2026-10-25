import { LitElement, html } from 'lit';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { getDeepActiveElement } from '../dom.js';
import { defineOnce, mount } from '../../test/utils.js';
import { FocusTrapController } from './focus-trap.js';

class TrapHost extends LitElement {
  initialFocus: (() => HTMLElement | null) | undefined;
  trap = new FocusTrapController(this, {
    container: () => this.renderRoot.querySelector<HTMLElement>('.panel'),
    initialFocus: () => this.initialFocus?.() ?? null,
  });

  override render() {
    return html`<div class="panel">
      <button id="first">First</button>
      <slot></slot>
      <button id="last">Last</button>
    </div>`;
  }
}

class EmptyTrapHost extends LitElement {
  trap = new FocusTrapController(this, {
    container: () => this.renderRoot.querySelector<HTMLElement>('.panel'),
  });

  override render() {
    return html`<div class="panel">Nothing focusable</div>`;
  }
}

defineOnce('t-trap', TrapHost);
defineOnce('t-trap-empty', EmptyTrapHost);

const focusedId = () => getDeepActiveElement()?.id;

async function setup() {
  const root = await mount(`
    <button id="outside">Outside</button>
    <t-trap id="outer"><button id="middle">Middle</button></t-trap>
    <button id="after">After</button>
  `);
  return {
    root,
    host: root.querySelector<TrapHost>('#outer')!,
    outside: root.querySelector<HTMLButtonElement>('#outside')!,
  };
}

describe('FocusTrapController', () => {
  it('focuses the first tabbable element on activate and restores focus on deactivate', async () => {
    const { host, outside } = await setup();
    outside.focus();

    host.trap.activate();
    expect(host.trap.active).toBe(true);
    expect(focusedId()).toBe('first');

    host.trap.deactivate();
    expect(host.trap.active).toBe(false);
    expect(document.activeElement).toBe(outside);
  });

  it('honors initialFocus and returnFocus: false', async () => {
    const { host, outside } = await setup();
    host.initialFocus = () => host.shadowRoot!.querySelector('#last');
    outside.focus();

    host.trap.activate();
    expect(focusedId()).toBe('last');

    host.trap.deactivate({ returnFocus: false });
    expect(focusedId()).toBe('last');
  });

  it('wraps Tab and Shift+Tab, including slotted content', async () => {
    const { host } = await setup();
    host.trap.activate();

    await userEvent.tab();
    expect(focusedId()).toBe('middle');
    await userEvent.tab();
    expect(focusedId()).toBe('last');
    await userEvent.tab();
    expect(focusedId()).toBe('first');
    await userEvent.tab({ shift: true });
    expect(focusedId()).toBe('last');

    host.trap.deactivate();
  });

  it('pulls focus back when it escapes', async () => {
    const { host, outside } = await setup();
    host.trap.activate();

    outside.focus();
    expect(focusedId()).toBe('first');

    host.trap.deactivate();
  });

  it('focuses the container when it has nothing tabbable', async () => {
    const root = await mount('<t-trap-empty></t-trap-empty>');
    const host = root.querySelector<EmptyTrapHost>('t-trap-empty')!;
    const panel = host.shadowRoot!.querySelector<HTMLElement>('.panel')!;

    host.trap.activate();
    expect(getDeepActiveElement()).toBe(panel);
    expect(panel.getAttribute('tabindex')).toBe('-1');

    await userEvent.tab();
    expect(getDeepActiveElement()).toBe(panel);
    host.trap.deactivate();
  });

  it('lets only the innermost of nested traps act, then hands back', async () => {
    const root = await mount(`
      <t-trap id="outer">
        <t-trap id="inner"><button id="inner-slotted">Inner slotted</button></t-trap>
      </t-trap>
    `);
    const outer = root.querySelector<TrapHost>('#outer')!;
    const inner = root.querySelector<TrapHost>('#inner')!;

    outer.trap.activate();
    inner.trap.activate();
    const innerFirst = inner.shadowRoot!.querySelector('#first');
    expect(getDeepActiveElement()).toBe(innerFirst);

    // Focusing the outer trap's own button escapes the inner trap and gets pulled back.
    outer.shadowRoot!.querySelector<HTMLButtonElement>('#last')!.focus();
    expect(getDeepActiveElement()).toBe(innerFirst);

    inner.trap.deactivate();
    expect(outer.trap.active).toBe(true);
    outer.shadowRoot!.querySelector<HTMLButtonElement>('#last')!.focus();
    expect(getDeepActiveElement()).toBe(outer.shadowRoot!.querySelector('#last'));
    outer.trap.deactivate({ returnFocus: false });
  });

  it('deactivates when the host is removed', async () => {
    const { host } = await setup();
    host.trap.activate();
    host.remove();
    expect(host.trap.active).toBe(false);
  });
});
