import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import type { EloCheckbox } from './checkbox.js';
import './checkbox.js';
import '../switch/switch.js';

describe('elo-checkbox', () => {
  it('is a labelled, described checkbox', async () => {
    await fixture('<elo-checkbox label="Subscribe" hint="Weekly, no spam"></elo-checkbox>');
    const box = page.getByRole('checkbox', { name: 'Subscribe' });
    await expect.element(box).not.toBeChecked();
    await expect.element(box).toHaveAccessibleDescription('Weekly, no spam');
  });

  it('toggles by click on the label and by Space, with checked set before input fires', async () => {
    const el = await fixture<EloCheckbox>('<elo-checkbox label="Subscribe"></elo-checkbox>');
    const onInput = vi.fn(() => el.checked);
    const onChange = vi.fn();
    el.addEventListener('input', onInput);
    el.addEventListener('change', onChange);

    await userEvent.click(page.getByText('Subscribe'));
    expect(el.checked).toBe(true);
    expect(onInput.mock.results[0]!.value).toBe(true);
    expect(onChange).toHaveBeenCalledOnce();

    // Safari doesn't focus checkboxes on click, so focus explicitly before using the keyboard.
    el.focus();
    await userEvent.keyboard(' ');
    expect(el.checked).toBe(false);
  });

  it('submits its value only when checked, and resets', async () => {
    const form = await fixture<HTMLFormElement>(
      '<form><elo-checkbox label="Terms" name="terms" value="yes" checked></elo-checkbox></form>',
    );
    const el = form.querySelector<EloCheckbox>('elo-checkbox')!;
    expect(new FormData(form).get('terms')).toBe('yes');

    el.checked = false;
    await el.updateComplete;
    expect(new FormData(form).has('terms')).toBe(false);

    form.reset();
    await el.updateComplete;
    expect(el.checked).toBe(true);
  });

  it('shows indeterminate as partially checked and clears it on toggle', async () => {
    const el = await fixture<EloCheckbox>(
      '<elo-checkbox label="All" indeterminate></elo-checkbox>',
    );
    const box = page.getByRole('checkbox', { name: 'All' });
    await expect.element(box).toBePartiallyChecked();

    await userEvent.click(box);
    expect(el.indeterminate).toBe(false);
    expect(el.checked).toBe(true);
  });

  it('blocks submission when required and unchecked', async () => {
    const form = await fixture<HTMLFormElement>(
      '<form><elo-checkbox label="Terms" required></elo-checkbox></form>',
    );
    const el = form.querySelector<EloCheckbox>('elo-checkbox')!;
    expect(el.validity.valueMissing).toBe(true);
    form.requestSubmit();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.error')).not.toBeNull();
  });
});

describe('elo-switch', () => {
  it('is announced as a switch and toggles', async () => {
    const el = await fixture<EloCheckbox>('<elo-switch label="Dark mode"></elo-switch>');
    const toggle = page.getByRole('switch', { name: 'Dark mode' });
    await expect.element(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await expect.element(toggle).toBeChecked();
    expect(el.checked).toBe(true);
  });
});

describe('checkbox and switch a11y (axe)', () => {
  for (const theme of ['light', 'dark'] as const) {
    it(`has no violations in the ${theme} theme`, async () => {
      const root = await fixture<HTMLElement>(`
        <div data-elo-theme="${theme}" style="background: var(--elo-color-bg)">
          <elo-checkbox label="Subscribe" hint="Weekly"></elo-checkbox>
          <elo-checkbox label="Checked" checked></elo-checkbox>
          <elo-checkbox label="Some" indeterminate></elo-checkbox>
          <elo-checkbox label="Terms" error="Required"></elo-checkbox>
          <elo-switch label="Notifications" checked></elo-switch>
          <elo-switch label="Disabled" disabled></elo-switch>
        </div>
      `);
      await expectNoA11yViolations(root);
    });
  }
});
