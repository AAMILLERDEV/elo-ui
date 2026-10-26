import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import type { EloAlert } from './alert.js';
import './alert.js';
import '../badge/badge.js';

describe('elo-alert', () => {
  it('has no live role unless announce is set', async () => {
    const el = await fixture<EloAlert>('<elo-alert heading="Heads up">Body</elo-alert>');
    expect(el.shadowRoot!.querySelector('[role]')).toBeNull();

    el.announce = true;
    el.variant = 'danger';
    await el.updateComplete;
    await expect.element(page.getByRole('alert')).toHaveTextContent('Heads up');

    el.variant = 'success';
    await el.updateComplete;
    await expect.element(page.getByRole('status')).toBeInTheDocument();
  });

  it('closes from its button unless elo-close is canceled', async () => {
    const el = await fixture<EloAlert>('<elo-alert closable>Saved</elo-alert>');
    const onClose = vi.fn();
    el.addEventListener('elo-close', onClose, { once: true });
    el.addEventListener('elo-close', (e) => e.preventDefault(), { once: true });

    await userEvent.click(page.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(el.hidden).toBe(false);

    await userEvent.click(page.getByRole('button', { name: 'Dismiss' }));
    expect(el.hidden).toBe(true);
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`has no axe violations for every variant (${theme})`, async () => {
      const variants = ['info', 'success', 'warning', 'danger', 'neutral'];
      const root = await fixture<HTMLElement>(`
        <div data-elo-theme="${theme}" style="background: var(--elo-color-bg)">
          ${variants.map((v) => `<elo-alert variant="${v}" heading="${v}" closable>Message</elo-alert>`).join('')}
          ${variants.map((v) => `<elo-badge variant="${v}" dot>${v}</elo-badge>`).join('')}
        </div>
      `);
      await expectNoA11yViolations(root);
    });
  }
});
