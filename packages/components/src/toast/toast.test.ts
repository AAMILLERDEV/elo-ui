import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@elo-ui/core/theme.css';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { toast } from './toast.js';

const tick = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const liveRegion = (politeness: string) =>
  document.querySelector(`[data-elo-announcer="${politeness}"]`)?.textContent;

afterEach(() => {
  document.querySelector('elo-toast-region')?.remove();
});

describe('toast()', () => {
  it('creates a labelled top-layer region and shows the toast', async () => {
    const el = toast({ heading: 'Saved', message: 'Your changes are live.' });
    await el.updateComplete;
    const region = page.getByRole('region', { name: 'Notifications' });
    await expect.element(region).toBeVisible();
    expect(region.element().matches(':popover-open')).toBe(true);
    await expect.element(region).toHaveTextContent('Your changes are live.');
    el.dismiss();
  });

  it('announces politely, and danger assertively', async () => {
    const info = toast({ heading: 'Saved', message: 'All good.' });
    await info.updateComplete;
    await expect.poll(() => liveRegion('polite')).toBe('Saved. All good.');

    const error = toast({ variant: 'danger', message: 'Upload failed.' });
    await error.updateComplete;
    await expect.poll(() => liveRegion('assertive')).toBe('Upload failed.');
    info.dismiss();
    error.dismiss();
  });

  it('dismisses itself after its duration, firing elo-close', async () => {
    const el = toast({ message: 'Copied', duration: 100 });
    const onClose = vi.fn();
    el.addEventListener('elo-close', onClose);
    await tick(250);
    expect(onClose).toHaveBeenCalledOnce();
    expect(el.isConnected).toBe(false);
  });

  it('pauses while hovered and resumes after', async () => {
    const el = toast({ message: 'Copied', duration: 300 });
    await el.updateComplete;
    // Dispatched directly: a real hover can lose a race with the timer on a busy machine.
    el.dispatchEvent(new PointerEvent('pointerenter'));
    await tick(600);
    expect(el.isConnected).toBe(true);
    el.dispatchEvent(new PointerEvent('pointerleave'));
    await expect.poll(() => el.isConnected, { timeout: 2000 }).toBe(false);
  });

  it('pauses while focused', async () => {
    const el = toast({ message: 'Copied', duration: 300 });
    await el.updateComplete;
    el.shadowRoot!.querySelector('button')!.focus();
    await tick(600);
    expect(el.isConnected).toBe(true);
    el.dismiss();
  });

  it('keeps danger toasts and toasts with an action open', async () => {
    const error = toast({ variant: 'danger', message: 'Failed' });
    const onUndo = vi.fn();
    const undo = toast({ message: 'Deleted', action: { label: 'Undo', onClick: onUndo } });
    await Promise.all([error.updateComplete, undo.updateComplete]);
    await tick(50);
    expect(error.isConnected && undo.isConnected).toBe(true);

    await userEvent.click(page.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledOnce();
    expect(undo.isConnected).toBe(false);
    error.dismiss();
  });

  it('dismisses from its button and with Escape', async () => {
    const a = toast({ message: 'One', duration: 0 });
    const b = toast({ message: 'Two', duration: 0 });
    await Promise.all([a.updateComplete, b.updateComplete]);
    await userEvent.click(a.shadowRoot!.querySelector('button')!);
    expect(a.isConnected).toBe(false);

    b.shadowRoot!.querySelector('button')!.focus();
    await userEvent.keyboard('{Escape}');
    expect(b.isConnected).toBe(false);
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`has no axe violations (${theme})`, async () => {
      document.documentElement.dataset.eloTheme = theme;
      const toasts = (['info', 'success', 'warning', 'danger', 'neutral'] as const).map((variant) =>
        toast({ variant, heading: variant, message: 'Message', duration: 0 }),
      );
      await Promise.all(toasts.map((t) => t.updateComplete));
      await expectNoA11yViolations(document.querySelector('elo-toast-region')!);
      toasts.forEach((t) => t.dismiss());
      delete document.documentElement.dataset.eloTheme;
    });
  }
});
