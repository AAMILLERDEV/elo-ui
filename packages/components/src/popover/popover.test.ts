import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import { expectFocused } from '../../test/focus.js';
import type { EloPopover } from './popover.js';
import './popover.js';
import '../button/button.js';
import '../checkbox/checkbox.js';

async function setup() {
  const root = await fixture<HTMLElement>(`
    <div style="padding: 2rem">
      <elo-popover label="Filters">
        <elo-button slot="trigger">Filters</elo-button>
        <elo-checkbox label="Only active"></elo-checkbox>
        <elo-checkbox label="Only mine"></elo-checkbox>
      </elo-popover>
      <button id="outside">Outside</button>
    </div>
  `);
  const popover = root.querySelector<EloPopover>('elo-popover')!;
  const trigger = page.getByRole('button', { name: 'Filters' });
  return { root, popover, trigger };
}

describe('elo-popover', () => {
  it('toggles from its trigger, which reports expanded and haspopup', async () => {
    const { popover, trigger } = await setup();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog');

    await userEvent.click(trigger);
    expect(popover.open).toBe(true);
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.element(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();

    await userEvent.click(trigger);
    expect(popover.open).toBe(false);
  });

  it('moves focus into the panel and back to the trigger on Escape', async () => {
    const { trigger } = await setup();
    await userEvent.click(trigger);
    await expectFocused(page.getByRole('checkbox', { name: 'Only active' }));

    await userEvent.keyboard('{Escape}');
    await expectFocused(trigger);
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on outside click and when focus leaves', async () => {
    const { popover, trigger } = await setup();
    const onClose = vi.fn();
    popover.addEventListener('elo-close', onClose);

    await userEvent.click(trigger);
    await userEvent.click(page.getByRole('button', { name: 'Outside' }));
    await popover.updateComplete;
    expect(popover.open).toBe(false);

    await userEvent.click(trigger);
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await popover.updateComplete;
    expect(popover.open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('positions the panel next to the trigger', async () => {
    const { popover, trigger } = await setup();
    await userEvent.click(trigger);
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));
    const panel = popover.shadowRoot!.querySelector<HTMLElement>('[popover]')!;
    const t = trigger.element().getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    expect(Math.abs(p.top - t.bottom - 8)).toBeLessThan(2);
    expect(Math.abs(p.left - t.left)).toBeLessThan(2);
  });

  it('has no axe violations open', async () => {
    const { root, trigger } = await setup();
    await userEvent.click(trigger);
    await expectNoA11yViolations(root);
  });
});
