import { afterEach, describe, expect, it } from 'vitest';
import { announce, clearAnnouncements } from './announcer.js';

const region = (politeness: string) =>
  document.querySelector<HTMLElement>(`[data-elo-announcer="${politeness}"]`);

afterEach(() => clearAnnouncements());

describe('announce', () => {
  it('creates a visually hidden polite live region and sets the message', async () => {
    await announce('Saved');
    const el = region('polite')!;
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.getAttribute('aria-atomic')).toBe('true');
    expect(el.textContent).toBe('Saved');

    const rect = el.getBoundingClientRect();
    expect(rect.width).toBeLessThanOrEqual(1);
    expect(rect.height).toBeLessThanOrEqual(1);
  });

  it('clears before re-announcing the same message', async () => {
    await announce('Saved');
    const pending = announce('Saved');
    expect(region('polite')!.textContent).toBe('');
    await pending;
    expect(region('polite')!.textContent).toBe('Saved');
  });

  it('uses a separate assertive region', async () => {
    await Promise.all([announce('Saved'), announce('Error', { politeness: 'assertive' })]);
    expect(region('polite')!.textContent).toBe('Saved');
    expect(region('assertive')!.textContent).toBe('Error');
    expect(region('assertive')!.getAttribute('aria-live')).toBe('assertive');
  });

  it('replaces a pending message with a newer one', async () => {
    const first = announce('Loading');
    const second = announce('Loaded');
    await Promise.all([first, second]);
    expect(region('polite')!.textContent).toBe('Loaded');
  });

  it('reuses one region and recreates it if removed', async () => {
    await announce('One');
    await announce('Two');
    expect(document.querySelectorAll('[data-elo-announcer="polite"]')).toHaveLength(1);

    region('polite')!.remove();
    await announce('Three');
    expect(region('polite')!.textContent).toBe('Three');
  });

  it('clearAnnouncements empties regions and cancels pending messages', async () => {
    await announce('Saved');
    const pending = announce('Never shown');
    clearAnnouncements();
    await pending;
    expect(region('polite')!.textContent).toBe('');
  });
});
