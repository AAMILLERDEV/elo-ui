import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import { initials, type EloAvatar } from './avatar.js';
import './avatar.js';
import '../tag/tag.js';
import '../link/link.js';

describe('initials', () => {
  it.each([
    ['Ada Lovelace', 'AL'],
    ['Grace Brewster Murray Hopper', 'GH'],
    ['cher', 'C'],
    ['  élodie  durand ', 'ÉD'],
    ['', ''],
  ])('%j → %j', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});

describe('elo-avatar', () => {
  it('shows initials as a named image', async () => {
    const el = await fixture<EloAvatar>('<elo-avatar name="Ada Lovelace"></elo-avatar>');
    await expect.element(page.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(el.shadowRoot!.textContent).toContain('AL');
  });

  it('falls back to initials when the image fails', async () => {
    const el = await fixture<EloAvatar>(
      '<elo-avatar name="Ada Lovelace" src="/does-not-exist.png"></elo-avatar>',
    );
    await expect.poll(() => el.shadowRoot!.querySelector('img')).toBeNull();
    await expect.element(page.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
  });

  it('is hidden from screen readers when decorative', async () => {
    const el = await fixture<EloAvatar>('<elo-avatar name="Ada Lovelace" decorative></elo-avatar>');
    expect(el.shadowRoot!.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(el.shadowRoot!.querySelector('[role="img"]')).toBeNull();
  });
});

describe('elo-tag', () => {
  it('names its remove button after the tag and fires elo-remove', async () => {
    const tag = await fixture<HTMLElement>('<elo-tag removable>Design</elo-tag>');
    const onRemove = vi.fn();
    tag.addEventListener('elo-remove', onRemove);
    await userEvent.click(page.getByRole('button', { name: 'Remove Design' }));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(tag.isConnected).toBe(true);
  });
});

describe('elo-link', () => {
  it('opens external links in a new tab and says so', async () => {
    await fixture('<elo-link href="https://example.com" external>Docs</elo-link>');
    const link = page.getByRole('link', { name: 'Docs (opens in a new tab)' });
    await expect.element(link).toHaveAttribute('target', '_blank');
    await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`has no axe violations (${theme})`, async () => {
      const root = await fixture<HTMLElement>(`
        <div data-elo-theme="${theme}" style="background: var(--elo-color-bg); color: var(--elo-color-fg); padding: 1rem">
          <elo-avatar name="Ada Lovelace"></elo-avatar>
          <elo-avatar name="Grace Hopper" size="lg"></elo-avatar>
          <elo-tag removable>Design</elo-tag>
          <elo-tag variant="success">Active</elo-tag>
          <p>Read the <elo-link href="/guide">guide</elo-link> or <elo-link href="https://example.com" external variant="subtle">blog</elo-link>.</p>
        </div>
      `);
      await expectNoA11yViolations(root);
    });
  }
});
