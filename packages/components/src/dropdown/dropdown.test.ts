import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import { expectFocused } from '../../test/focus.js';
import type { EloDropdown } from './dropdown.js';
import './dropdown.js';
import '../button/button.js';
import '../menu-item/menu-item.js';
import '../menu-separator/menu-separator.js';

async function setup() {
  const root = await fixture<HTMLElement>(`
    <div>
      <elo-dropdown>
        <elo-button slot="trigger">Actions</elo-button>
        <elo-menu-item value="edit">Edit</elo-menu-item>
        <elo-menu-item value="duplicate">Duplicate</elo-menu-item>
        <elo-menu-item value="archive" disabled>Archive</elo-menu-item>
        <elo-menu-separator></elo-menu-separator>
        <elo-menu-item value="delete" variant="danger">Delete</elo-menu-item>
      </elo-dropdown>
    </div>
  `);
  const dropdown = root.querySelector<EloDropdown>('elo-dropdown')!;
  const trigger = page.getByRole('button', { name: 'Actions' });
  const item = (name: string) => page.getByRole('menuitem', { name });
  return { root, dropdown, trigger, item };
}

describe('elo-dropdown', () => {
  it('is a menu button: trigger reports haspopup and expanded', async () => {
    const { trigger } = await setup();
    await expect.element(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect.element(page.getByRole('menu', { name: 'Actions' })).toBeVisible();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens on click with focus on the first item', async () => {
    const { trigger, item } = await setup();
    await userEvent.click(trigger);
    await expectFocused(item('Edit'));
  });

  it('opens with ArrowUp on the last item and ArrowDown on the first', async () => {
    const { dropdown, trigger, item } = await setup();
    trigger.element().focus();
    await userEvent.keyboard('{ArrowUp}');
    await expectFocused(item('Delete'));

    dropdown.hide();
    await dropdown.updateComplete;
    trigger.element().focus();
    await userEvent.keyboard('{ArrowDown}');
    await expectFocused(item('Edit'));
  });

  it('moves with arrows, skips disabled items, wraps, and supports type-ahead', async () => {
    const { trigger, item } = await setup();
    await userEvent.click(trigger);
    await userEvent.keyboard('{ArrowDown}');
    await expectFocused(item('Duplicate'));
    await userEvent.keyboard('{ArrowDown}');
    await expectFocused(item('Delete'));
    await userEvent.keyboard('{ArrowDown}');
    await expectFocused(item('Edit'));
    await userEvent.keyboard('d');
    await expectFocused(item('Duplicate'));
    await expect.element(item('Archive')).toHaveAttribute('aria-disabled', 'true');
  });

  it('fires elo-select, closes, and returns focus on Enter', async () => {
    const { dropdown, trigger, item } = await setup();
    const onSelect = vi.fn((e: Event) => (e as CustomEvent).detail.value);
    dropdown.addEventListener('elo-select', onSelect);

    await userEvent.click(trigger);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelect.mock.results[0]!.value).toBe('duplicate');
    expect(dropdown.open).toBe(false);
    await expectFocused(trigger);

    await userEvent.click(trigger);
    await userEvent.click(item('Archive'), { force: true });
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('stays open when elo-select is canceled', async () => {
    const { dropdown, trigger, item } = await setup();
    dropdown.addEventListener('elo-select', (e) => e.preventDefault());
    await userEvent.click(trigger);
    await userEvent.click(item('Edit'));
    expect(dropdown.open).toBe(true);
  });

  it('closes on Escape with focus on the trigger', async () => {
    const { dropdown, trigger } = await setup();
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await dropdown.updateComplete;
    expect(dropdown.open).toBe(false);
    await expectFocused(trigger);
  });

  it('has no axe violations open', async () => {
    const { root, trigger } = await setup();
    await userEvent.click(trigger);
    await expectNoA11yViolations(root);
  });
});
