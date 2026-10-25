import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import { expectFocused } from '../../test/focus.js';
import type { EloTooltip } from './tooltip.js';
import './tooltip.js';
import '../button/button.js';

const tick = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function setup(trigger = '<elo-button label="Copy">⧉</elo-button>') {
  const root = await fixture<HTMLElement>(`
    <div style="padding: 4rem">
      <button id="before">Before</button>
      <elo-tooltip content="Copy link to clipboard" show-delay="50">${trigger}</elo-tooltip>
    </div>
  `);
  const tooltip = root.querySelector<EloTooltip>('elo-tooltip')!;
  const bubble = () => tooltip.shadowRoot!.querySelector<HTMLElement>('[popover]')!;
  return { root, tooltip, bubble };
}

describe('elo-tooltip', () => {
  it('describes an elo-button trigger without changing its name', async () => {
    await setup();
    const button = page.getByRole('button', { name: 'Copy' });
    await expect.element(button).toHaveAccessibleName('Copy');
    await expect.element(button).toHaveAccessibleDescription('Copy link to clipboard');
  });

  it('describes a native trigger through a light DOM description', async () => {
    await setup('<button>Share</button>');
    await expect
      .element(page.getByRole('button', { name: 'Share' }))
      .toHaveAccessibleDescription('Copy link to clipboard');
  });

  it('shows on keyboard focus immediately and hides on blur', async () => {
    const { tooltip, bubble } = await setup();
    await userEvent.click(page.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    await tick(10);
    expect(tooltip.open).toBe(true);
    expect(bubble().matches(':popover-open')).toBe(true);

    await userEvent.tab({ shift: true });
    await tick(150);
    expect(tooltip.open).toBe(false);
  });

  it('shows on hover after the delay, and Escape dismisses it without moving focus', async () => {
    const { tooltip } = await setup();
    // A long delay so a slow hover under parallel load can't outlast it.
    tooltip.showDelay = 500;
    const button = page.getByRole('button', { name: 'Copy' });
    await userEvent.hover(button);
    expect(tooltip.open).toBe(false);
    await tick(650);
    expect(tooltip.open).toBe(true);

    button.element().focus();
    await userEvent.keyboard('{Escape}');
    expect(tooltip.open).toBe(false);
    await expectFocused(button);
  });

  it('stays open while the pointer moves onto the tooltip', async () => {
    const { tooltip, bubble } = await setup();
    await userEvent.hover(page.getByRole('button', { name: 'Copy' }));
    await tick(100);
    await userEvent.hover(bubble());
    await tick(200);
    expect(tooltip.open).toBe(true);
  });

  it('has no axe violations while showing', async () => {
    const { root } = await setup();
    await userEvent.click(page.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    await tick(10);
    await expectNoA11yViolations(root);
  });
});
