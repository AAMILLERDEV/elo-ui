import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import type { EloRadioGroup } from './radio-group.js';
import './radio-group.js';

const radios = `
  <elo-radio value="monthly">Monthly</elo-radio>
  <elo-radio value="yearly">Yearly</elo-radio>
  <elo-radio value="lifetime" disabled>Lifetime</elo-radio>
  <elo-radio value="free">Free</elo-radio>
`;

async function setup(attrs = '') {
  const root = await fixture<HTMLElement>(`
    <form>
      <button type="button">Before</button>
      <elo-radio-group label="Plan" name="plan" hint="Billed in USD" ${attrs}>${radios}</elo-radio-group>
      <button type="button">After</button>
    </form>
  `);
  return {
    form: root as HTMLFormElement,
    group: root.querySelector<EloRadioGroup>('elo-radio-group')!,
    radio: (name: string) => page.getByRole('radio', { name }),
  };
}

describe('elo-radio-group', () => {
  it('is a labelled, described radiogroup of radios', async () => {
    const { radio } = await setup('value="yearly"');
    const group = page.getByRole('radiogroup', { name: 'Plan' });
    await expect.element(group).toHaveAccessibleDescription('Billed in USD');
    await expect.element(radio('Yearly')).toBeChecked();
    await expect.element(radio('Monthly')).not.toBeChecked();
    await expect.element(radio('Lifetime')).toBeDisabled();
  });

  it('is one Tab stop that lands on the checked radio', async () => {
    const { radio } = await setup('value="yearly"');
    await userEvent.click(page.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    await expect.element(radio('Yearly')).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('moves and selects with arrow keys, skipping disabled radios', async () => {
    const { group, radio } = await setup('value="yearly"');
    const onChange = vi.fn(() => group.value);
    group.addEventListener('change', onChange);

    (group.querySelector('[value="yearly"]') as HTMLElement).focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(radio('Free')).toHaveFocus();
    expect(group.value).toBe('free');
    expect(onChange.mock.results.at(-1)!.value).toBe('free');

    await userEvent.keyboard('{ArrowUp}');
    expect(group.value).toBe('yearly');
  });

  it('selects with click and Space, but not by tabbing in', async () => {
    const { group, radio } = await setup();
    await userEvent.click(page.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    await expect.element(radio('Monthly')).toHaveFocus();
    expect(group.value).toBe('');

    await userEvent.keyboard(' ');
    expect(group.value).toBe('monthly');

    await userEvent.click(radio('Free'));
    expect(group.value).toBe('free');
  });

  it('submits, resets, and validates required', async () => {
    const { form, group } = await setup('required value="monthly"');
    expect(new FormData(form).get('plan')).toBe('monthly');

    group.value = '';
    await group.updateComplete;
    expect(group.validity.valueMissing).toBe(true);
    form.requestSubmit();
    await group.updateComplete;
    expect(group.shadowRoot!.querySelector('.error')).not.toBeNull();

    form.reset();
    await group.updateComplete;
    expect(group.value).toBe('monthly');
  });

  it('disables every radio when the group is disabled', async () => {
    const { group, radio } = await setup('disabled value="yearly"');
    await expect.element(radio('Monthly')).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(radio('Free'), { force: true });
    expect(group.value).toBe('yearly');
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`has no axe violations in the ${theme} theme`, async () => {
      const { form, group } = await setup('value="yearly" error="Pick a plan"');
      form.dataset.eloTheme = theme;
      form.style.background = 'var(--elo-color-bg)';
      await expectNoA11yViolations(group);
    });
  }
});
