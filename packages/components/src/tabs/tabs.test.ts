import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import { expectFocused } from '../../test/focus.js';
import type { EloTabs } from './tabs.js';
import './tabs.js';
import '../tab/tab.js';
import '../tab-panel/tab-panel.js';
import '../input/input.js';

async function setup(attrs = '') {
  const tabs = await fixture<EloTabs>(`
    <elo-tabs label="Project settings" ${attrs}>
      <elo-tab panel="general">General</elo-tab>
      <elo-tab panel="members">Members</elo-tab>
      <elo-tab panel="billing" disabled>Billing</elo-tab>
      <elo-tab panel="danger">Danger zone</elo-tab>
      <elo-tab-panel name="general"><elo-input label="Project name"></elo-input></elo-tab-panel>
      <elo-tab-panel name="members">Three members</elo-tab-panel>
      <elo-tab-panel name="billing">Billing</elo-tab-panel>
      <elo-tab-panel name="danger">Delete project</elo-tab-panel>
    </elo-tabs>
  `);
  const tab = (name: string) => page.getByRole('tab', { name });
  return { tabs, tab };
}

describe('elo-tabs', () => {
  it('wires a labelled tablist to its panels', async () => {
    const { tabs, tab } = await setup();
    await expect
      .element(page.getByRole('tablist', { name: 'Project settings' }))
      .toBeInTheDocument();
    await expect.element(tab('General')).toHaveAttribute('aria-selected', 'true');
    const panel = page.getByRole('tabpanel', { name: 'General' });
    await expect.element(panel).toBeVisible();
    expect(tab('General').element().getAttribute('aria-controls')).toBe(panel.element().id);
    expect(tabs.value).toBe('general');
    expect(tabs.panels.filter((p) => !p.hidden)).toHaveLength(1);
  });

  it('is one Tab stop; arrows move and select, skipping disabled tabs', async () => {
    const { tabs, tab } = await setup();
    const onChange = vi.fn((e: Event) => (e as CustomEvent).detail.value);
    tabs.addEventListener('elo-change', onChange);

    tab('General').element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expectFocused(tab('Members'));
    expect(tabs.value).toBe('members');
    await userEvent.keyboard('{ArrowRight}');
    await expectFocused(tab('Danger zone'));
    await userEvent.keyboard('{Home}');
    expect(tabs.value).toBe('general');
    expect(onChange.mock.results.map((r) => r.value)).toEqual(['members', 'danger', 'general']);
  });

  it('Tab moves from the tab list into the panel', async () => {
    const { tab } = await setup('value="members"');
    tab('Members').element().focus();
    await userEvent.tab();
    await expectFocused(page.getByRole('tabpanel', { name: 'Members' }));
  });

  it('waits for Enter or Space with manual activation', async () => {
    const { tabs, tab } = await setup('activation="manual"');
    tab('General').element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expectFocused(tab('Members'));
    expect(tabs.value).toBe('general');
    await userEvent.keyboard('{Enter}');
    expect(tabs.value).toBe('members');
  });

  it('selects on click and ignores disabled tabs', async () => {
    const { tabs, tab } = await setup();
    await userEvent.click(tab('Danger zone'));
    expect(tabs.value).toBe('danger');
    await userEvent.click(tab('Billing'), { force: true });
    expect(tabs.value).toBe('danger');
  });

  for (const orientation of ['horizontal', 'vertical'] as const) {
    it(`has no axe violations (${orientation})`, async () => {
      const { tabs } = await setup(`orientation="${orientation}"`);
      await expectNoA11yViolations(tabs);
    });
  }
});
