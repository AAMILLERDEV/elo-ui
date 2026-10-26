import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import { pageSlots, type EloPagination } from './pagination.js';
import './pagination.js';
import '../breadcrumb/breadcrumb.js';
import '../breadcrumb-item/breadcrumb-item.js';
import '../card/card.js';
import '../divider/divider.js';

describe('pageSlots', () => {
  it.each([
    [1, 5, [1, 2, 3, 4, 5]],
    [1, 20, [1, 2, 3, 4, 5, 'gap', 20]],
    [10, 20, [1, 'gap', 9, 10, 11, 'gap', 20]],
    [20, 20, [1, 'gap', 16, 17, 18, 19, 20]],
    [4, 20, [1, 2, 3, 4, 5, 'gap', 20]],
    [5, 20, [1, 'gap', 4, 5, 6, 'gap', 20]],
    [17, 20, [1, 'gap', 16, 17, 18, 19, 20]],
  ] as const)('page %i of %i', (current, total, expected) => {
    expect(pageSlots(current, total)).toEqual(expected);
  });

  it('always shows the same number of slots once pages overflow', () => {
    for (let p = 1; p <= 50; p++) expect(pageSlots(p, 50)).toHaveLength(7);
  });
});

describe('elo-pagination', () => {
  it('is a labelled nav with the current page marked', async () => {
    await fixture('<elo-pagination page="3" total-pages="10"></elo-pagination>');
    await expect.element(page.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    await expect
      .element(page.getByRole('button', { name: 'Page 3' }))
      .toHaveAttribute('aria-current', 'page');
  });

  it('fires elo-page-change and disables previous on the first page', async () => {
    const el = await fixture<EloPagination>(
      '<elo-pagination page="1" total-pages="10"></elo-pagination>',
    );
    const onChange = vi.fn((e: Event) => (e as CustomEvent).detail.page);
    el.addEventListener('elo-page-change', onChange);

    await expect
      .element(page.getByRole('button', { name: 'Previous page' }))
      .toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(page.getByRole('button', { name: 'Previous page' }), { force: true });
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.click(page.getByRole('button', { name: 'Next page' }));
    await userEvent.click(page.getByRole('button', { name: 'Page 5' }));
    expect(onChange.mock.results.map((r) => r.value)).toEqual([2, 5]);
    expect(el.page).toBe(5);
  });

  it('renders links with href-template', async () => {
    await fixture(
      '<elo-pagination page="2" total-pages="5" href-template="/orders?page={page}"></elo-pagination>',
    );
    await expect
      .element(page.getByRole('link', { name: 'Page 3' }))
      .toHaveAttribute('href', '/orders?page=3');
    await expect
      .element(page.getByRole('link', { name: 'Next page' }))
      .toHaveAttribute('href', '/orders?page=3');
  });
});

describe('elo-breadcrumb, elo-card, elo-divider', () => {
  it('marks the last breadcrumb as the current page', async () => {
    await fixture(`
      <elo-breadcrumb>
        <elo-breadcrumb-item href="/">Home</elo-breadcrumb-item>
        <elo-breadcrumb-item href="/projects">Projects</elo-breadcrumb-item>
        <elo-breadcrumb-item href="/projects/1">Website</elo-breadcrumb-item>
      </elo-breadcrumb>
    `);
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect.element(nav).toBeInTheDocument();
    // Items are slotted, so count them page-wide rather than inside the shadow nav.
    expect(page.getByRole('listitem').elements()).toHaveLength(3);
    await expect
      .element(page.getByRole('link', { name: 'Projects' }))
      .toHaveAttribute('href', '/projects');
    const items = document.querySelectorAll('elo-breadcrumb-item');
    const current = items[2]!.shadowRoot!.querySelector('[aria-current="page"]');
    expect(current).not.toBeNull();
    expect(items[2]!.shadowRoot!.querySelector('a')).toBeNull();
    expect(items[1]!.shadowRoot!.querySelector('[aria-current]')).toBeNull();
  });

  it('gives the card a heading at the chosen level, and the divider a separator role', async () => {
    await fixture(`
      <div>
        <elo-card heading="Revenue" heading-level="2">$12,400</elo-card>
        <elo-divider></elo-divider>
      </div>
    `);
    await expect
      .element(page.getByRole('heading', { name: 'Revenue', level: 2 }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole('separator'))
      .toHaveAttribute('aria-orientation', 'horizontal');
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`has no axe violations (${theme})`, async () => {
      const root = await fixture<HTMLElement>(`
        <div data-elo-theme="${theme}" style="background: var(--elo-color-bg); padding: 1rem">
          <elo-breadcrumb>
            <elo-breadcrumb-item href="/">Home</elo-breadcrumb-item>
            <elo-breadcrumb-item>Settings</elo-breadcrumb-item>
          </elo-breadcrumb>
          <elo-card heading="Revenue"><span slot="actions">⋯</span>$12,400<span slot="footer">Updated today</span></elo-card>
          <elo-card>No heading</elo-card>
          <elo-divider></elo-divider>
          <elo-pagination page="6" total-pages="12"></elo-pagination>
        </div>
      `);
      await expectNoA11yViolations(root);
    });
  }
});
