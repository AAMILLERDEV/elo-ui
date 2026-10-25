import { getDeepActiveElement } from '@elo-ui/core';
import { expect } from 'vitest';
import type { Locator } from 'vitest/browser';

/** Like toHaveFocus(), but sees focus inside shadow roots. */
export async function expectFocused(target: Locator | Element): Promise<void> {
  const el = target instanceof Element ? target : target.element();
  await expect.poll(() => getDeepActiveElement()).toBe(el);
}
