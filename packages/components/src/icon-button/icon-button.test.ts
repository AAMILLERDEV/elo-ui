import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import type { EloIconButton } from './icon-button.js';
import './icon-button.js';
import '../button-group/button-group.js';

const gear = '<svg aria-hidden="true" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3"/></svg>';
const tick = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('elo-icon-button', () => {
  it('uses its label as the name, without repeating it as a description', async () => {
    const el = await fixture<EloIconButton>(
      `<elo-icon-button label="Settings">${gear}</elo-icon-button>`,
    );
    const button = page.getByRole('button', { name: 'Settings' });
    await expect.element(button).toHaveAccessibleName('Settings');
    await expect.element(button).not.toHaveAccessibleDescription('Settings');
    expect(el.variant).toBe('ghost');
  });

  it('shows its label as a tooltip on focus, unless no-tooltip', async () => {
    const root = await fixture<HTMLElement>(`
      <div><button>Before</button><elo-icon-button label="Settings">${gear}</elo-icon-button></div>
    `);
    await userEvent.click(page.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    await tick(20);
    const tooltip = root
      .querySelector('elo-icon-button')!
      .shadowRoot!.querySelector('elo-tooltip')!;
    expect(tooltip.open).toBe(true);

    const plain = await fixture<EloIconButton>(
      `<elo-icon-button label="Edit" no-tooltip>${gear}</elo-icon-button>`,
    );
    expect(plain.shadowRoot!.querySelector('elo-tooltip')).toBeNull();
  });

  it('renders its icon visibly', async () => {
    const el = await fixture<EloIconButton>(
      `<elo-icon-button label="Settings">${gear}</elo-icon-button>`,
    );
    const box = el.querySelector('svg')!.getBoundingClientRect();
    expect(box.width).toBeGreaterThan(10);
    expect(box.height).toBeGreaterThan(10);
  });

  it('keeps an explicit variant', async () => {
    const el = await fixture<EloIconButton>(
      `<elo-icon-button label="Delete" variant="danger">${gear}</elo-icon-button>`,
    );
    expect(el.variant).toBe('danger');
  });
});

describe('elo-button-group', () => {
  it('is a labelled group with joined corners', async () => {
    const group = await fixture<HTMLElement>(`
      <elo-button-group label="View">
        <elo-button>List</elo-button>
        <elo-button>Board</elo-button>
        <elo-button>Calendar</elo-button>
      </elo-button-group>
    `);
    await expect.element(page.getByRole('group', { name: 'View' })).toBeInTheDocument();
    const radius = (i: number) => {
      const control = group.children[i]!.shadowRoot!.querySelector('button')!;
      const cs = getComputedStyle(control);
      return [cs.borderStartStartRadius, cs.borderStartEndRadius];
    };
    expect(radius(0)[1]).toBe('0px');
    expect(radius(1)).toEqual(['0px', '0px']);
    expect(radius(2)[0]).toBe('0px');
    expect(radius(0)[0]).not.toBe('0px');
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`has no axe violations (${theme})`, async () => {
      const root = await fixture<HTMLElement>(`
        <div data-elo-theme="${theme}" style="background: var(--elo-color-bg); padding: 1rem">
          <elo-button-group label="View"><elo-button>List</elo-button><elo-button>Board</elo-button></elo-button-group>
          <elo-icon-button label="Settings">${gear}</elo-icon-button>
        </div>
      `);
      await expectNoA11yViolations(root);
    });
  }
});
