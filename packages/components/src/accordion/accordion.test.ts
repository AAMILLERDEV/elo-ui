import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import { expectFocused } from '../../test/focus.js';
import type { EloAccordion } from './accordion.js';
import type { EloAccordionItem } from '../accordion-item/accordion-item.js';
import './accordion.js';
import '../accordion-item/accordion-item.js';

async function setup(attrs = '') {
  const accordion = await fixture<EloAccordion>(`
    <elo-accordion ${attrs}>
      <elo-accordion-item heading="Shipping">Ships in 2 days.</elo-accordion-item>
      <elo-accordion-item heading="Returns" open>30-day returns.</elo-accordion-item>
      <elo-accordion-item heading="Warranty" heading-level="4">One year.</elo-accordion-item>
    </elo-accordion>
  `);
  const button = (name: string) => page.getByRole('button', { name });
  return { accordion, button, items: accordion.items };
}

describe('elo-accordion', () => {
  it('renders headings with toggle buttons that control labelled regions', async () => {
    const { button } = await setup();
    await expect
      .element(page.getByRole('heading', { name: 'Shipping', level: 3 }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole('heading', { name: 'Warranty', level: 4 }))
      .toBeInTheDocument();
    await expect.element(button('Shipping')).toHaveAttribute('aria-expanded', 'false');
    await expect.element(button('Returns')).toHaveAttribute('aria-expanded', 'true');
    await expect.element(page.getByRole('region', { name: 'Returns' })).toBeVisible();
  });

  it('toggles items and fires elo-open and elo-close', async () => {
    const { button, items } = await setup();
    const events: string[] = [];
    items[0]!.addEventListener('elo-open', () => events.push('open'));
    items[0]!.addEventListener('elo-close', () => events.push('close'));

    await userEvent.click(button('Shipping'));
    await expect.element(page.getByRole('region', { name: 'Shipping' })).toBeVisible();
    await userEvent.click(button('Shipping'));
    expect(items[0]!.open).toBe(false);
    expect(events).toEqual(['open', 'close']);
    expect(items[1]!.open).toBe(true);
  });

  it('keeps one item open when exclusive', async () => {
    const { button, items } = await setup('exclusive');
    await userEvent.click(button('Shipping'));
    await (items[1] as EloAccordionItem).updateComplete;
    expect(items.map((i) => i.open)).toEqual([true, false, false]);
  });

  it('moves between headers with arrows, Home, and End', async () => {
    const { button } = await setup();
    button('Shipping').element().focus();
    await userEvent.keyboard('{ArrowDown}');
    await expectFocused(button('Returns'));
    await userEvent.keyboard('{End}');
    await expectFocused(button('Warranty'));
    await userEvent.keyboard('{ArrowDown}');
    await expectFocused(button('Shipping'));
    await userEvent.keyboard('{ArrowUp}');
    await expectFocused(button('Warranty'));
  });

  it('has no axe violations', async () => {
    const { accordion } = await setup();
    await expectNoA11yViolations(accordion);
  });

  it('does not fire events on first render', async () => {
    const onOpen = vi.fn();
    document.addEventListener('elo-open', onOpen);
    await setup();
    document.removeEventListener('elo-open', onOpen);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
