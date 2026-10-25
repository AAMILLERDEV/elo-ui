import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import type { EloTextarea } from './textarea.js';
import './textarea.js';

describe('elo-textarea', () => {
  it('is a labelled, described multi-line textbox', async () => {
    await fixture('<elo-textarea label="Notes" hint="Markdown supported"></elo-textarea>');
    const textarea = page.getByRole('textbox', { name: 'Notes' });
    await expect.element(textarea).toHaveAccessibleDescription('Markdown supported');
    await expect.element(textarea).toHaveAttribute('rows', '3');
  });

  it('tracks typing, submits, and resets', async () => {
    const form = await fixture<HTMLFormElement>(
      '<form><elo-textarea label="Notes" name="notes" value="Hi"></elo-textarea></form>',
    );
    const el = form.querySelector<EloTextarea>('elo-textarea')!;
    await userEvent.type(page.getByRole('textbox', { name: 'Notes' }), ' there');
    expect(el.value).toBe('Hi there');
    expect(new FormData(form).get('notes')).toBe('Hi there');

    form.reset();
    await el.updateComplete;
    expect(el.value).toBe('Hi');
  });

  it('validates minlength after a submit attempt', async () => {
    const form = await fixture<HTMLFormElement>(
      '<form><elo-textarea label="Bio" minlength="10" required></elo-textarea></form>',
    );
    const el = form.querySelector<EloTextarea>('elo-textarea')!;
    expect(el.shadowRoot!.querySelector('.error')).toBeNull();
    form.requestSubmit();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.error')).not.toBeNull();
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`has no axe violations in the ${theme} theme`, async () => {
      const root = await fixture<HTMLElement>(`
        <div data-elo-theme="${theme}" style="background: var(--elo-color-bg)">
          <elo-textarea label="Notes" hint="Optional"></elo-textarea>
          <elo-textarea label="Bio" error="Too short"></elo-textarea>
        </div>
      `);
      await expectNoA11yViolations(root);
    });
  }
});
