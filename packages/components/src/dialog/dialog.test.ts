import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { getDeepActiveElement } from '@elo-ui/core';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import { expectFocused } from '../../test/focus.js';
import type { EloDialog } from './dialog.js';
import './dialog.js';
import '../button/button.js';
import '../input/input.js';

async function setup(attrs = '') {
  const root = await fixture<HTMLElement>(`
    <div>
      <button id="opener">Open</button>
      <elo-dialog label="Delete project" ${attrs}>
        <p>This can't be undone.</p>
        <elo-button slot="footer" id="cancel">Cancel</elo-button>
        <elo-button slot="footer" variant="danger">Delete</elo-button>
      </elo-dialog>
    </div>
  `);
  const dialog = root.querySelector<EloDialog>('elo-dialog')!;
  const opener = root.querySelector<HTMLButtonElement>('#opener')!;
  opener.focus();
  return { root, dialog, opener };
}

async function open(dialog: EloDialog) {
  dialog.show();
  await dialog.updateComplete;
}

describe('elo-dialog', () => {
  it('opens as a labelled modal dialog and fires elo-open', async () => {
    const { dialog } = await setup();
    const onOpen = vi.fn();
    dialog.addEventListener('elo-open', onOpen);
    await open(dialog);

    const native = page.getByRole('dialog', { name: 'Delete project' });
    await expect.element(native).toBeVisible();
    expect(dialog.shadowRoot!.querySelector('dialog')!.matches(':modal')).toBe(true);
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('moves focus inside, traps it, and returns it on close', async () => {
    const { dialog, opener } = await setup();
    await open(dialog);
    expect(
      dialog.contains(getDeepActiveElement()) ||
        dialog.shadowRoot!.contains(getDeepActiveElement()),
    ).toBe(true);

    // Tab may leave the document for browser UI, but never reaches the inert page behind.
    for (let i = 0; i < 5; i++) {
      await userEvent.tab();
      expect(getDeepActiveElement()).not.toBe(opener);
    }

    dialog.close();
    await dialog.updateComplete;
    expect(document.activeElement).toBe(opener);
  });

  it('closes on Escape, the close button, and the backdrop, reporting the source', async () => {
    const { dialog } = await setup();
    const sources: string[] = [];
    dialog.addEventListener('elo-request-close', (e) =>
      sources.push((e as CustomEvent).detail.source),
    );

    await open(dialog);
    await userEvent.keyboard('{Escape}');
    await dialog.updateComplete;
    expect(dialog.open).toBe(false);

    await open(dialog);
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await dialog.updateComplete;
    expect(dialog.open).toBe(false);

    await open(dialog);
    const native = dialog.shadowRoot!.querySelector('dialog')!;
    native.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    native.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await dialog.updateComplete;
    expect(dialog.open).toBe(false);

    expect(sources).toEqual(['escape', 'close-button', 'backdrop']);
  });

  it('stays open when elo-request-close is canceled', async () => {
    const { dialog } = await setup();
    dialog.addEventListener('elo-request-close', (e) => e.preventDefault());
    await open(dialog);
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await dialog.updateComplete;
    expect(dialog.open).toBe(true);
    dialog.close();
  });

  it('ignores backdrop clicks with no-light-dismiss', async () => {
    const { dialog } = await setup('no-light-dismiss');
    await open(dialog);
    const native = dialog.shadowRoot!.querySelector('dialog')!;
    native.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    native.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await dialog.updateComplete;
    expect(dialog.open).toBe(true);
    dialog.close();
  });

  it('locks page scroll while open', async () => {
    const { dialog } = await setup();
    await open(dialog);
    expect(document.documentElement.style.overflow).toBe('hidden');
    dialog.close();
    await dialog.updateComplete;
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('honors autofocus on slotted content', async () => {
    const root = await fixture<HTMLElement>(`
      <elo-dialog label="Rename"><elo-input label="Name" autofocus></elo-input></elo-dialog>
    `);
    const dialog = root as unknown as EloDialog;
    await open(dialog);
    await expectFocused(page.getByRole('textbox', { name: 'Name' }));
    dialog.close();
  });

  for (const placement of ['center', 'end'] as const) {
    it(`has no axe violations open (${placement})`, async () => {
      const { root, dialog } = await setup(`placement="${placement}"`);
      await open(dialog);
      await expectNoA11yViolations(root);
      dialog.close();
    });
  }
});
