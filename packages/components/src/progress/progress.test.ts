import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import type { EloProgress } from './progress.js';
import './progress.js';
import '../spinner/spinner.js';
import '../skeleton/skeleton.js';

describe('elo-progress, elo-spinner, elo-skeleton', () => {
  it('exposes a labelled progressbar with its value', async () => {
    const el = await fixture<EloProgress>(
      '<elo-progress label="Uploading" value="30" max="60"></elo-progress>',
    );
    const bar = page.getByRole('progressbar', { name: 'Uploading' });
    await expect.element(bar).toHaveAttribute('aria-valuenow', '30');
    await expect.element(bar).toHaveAttribute('aria-valuemax', '60');
    await expect.element(bar).toHaveAttribute('aria-valuetext', '50%');

    el.valueText = '3 of 6 files';
    await el.updateComplete;
    await expect.element(bar).toHaveAttribute('aria-valuetext', '3 of 6 files');
  });

  it('is indeterminate without a value', async () => {
    await fixture('<elo-progress label="Preparing"></elo-progress>');
    const bar = page.getByRole('progressbar', { name: 'Preparing' });
    await expect.element(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('labels the spinner and hides skeletons from assistive tech', async () => {
    const root = await fixture<HTMLElement>(`
      <div aria-busy="true"><elo-spinner label="Loading orders"></elo-spinner><elo-skeleton></elo-skeleton></div>
    `);
    await expect
      .element(page.getByRole('progressbar', { name: 'Loading orders' }))
      .toBeInTheDocument();
    expect(root.querySelector('elo-skeleton')!.getAttribute('aria-hidden')).toBe('true');
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`has no axe violations (${theme})`, async () => {
      const root = await fixture<HTMLElement>(`
        <div data-elo-theme="${theme}" style="background: var(--elo-color-bg)">
          <elo-progress label="Storage" value="42"></elo-progress>
          <elo-progress label="Preparing"></elo-progress>
          <elo-spinner></elo-spinner>
          <elo-skeleton shape="circle"></elo-skeleton>
        </div>
      `);
      await expectNoA11yViolations(root);
    });
  }
});
