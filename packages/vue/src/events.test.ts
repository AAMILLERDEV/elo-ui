import '@elo-ui/core/theme.css';
import '@elo-ui/components';
import { createApp } from 'vue';
import { expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { eloCompilerOptions } from './index.js';

it('listens to custom events with @elo-*', async () => {
  const onSelect = vi.fn((e: CustomEvent<{ value: string }>) => e.detail.value);
  const host = document.createElement('div');
  document.body.append(host);
  const app = createApp({
    setup: () => ({ onSelect }),
    template: `
      <elo-dropdown @elo-select="onSelect">
        <elo-button slot="trigger">Actions</elo-button>
        <elo-menu-item value="edit">Edit</elo-menu-item>
      </elo-dropdown>
    `,
  });
  Object.assign(app.config.compilerOptions, eloCompilerOptions);
  app.mount(host);
  await (host.querySelector('elo-dropdown') as unknown as { updateComplete: Promise<void> })
    .updateComplete;

  await userEvent.click(host.querySelector('elo-button')!);
  await userEvent.click(host.querySelector('elo-menu-item')!);
  expect(onSelect.mock.results[0]!.value).toBe('edit');

  app.unmount();
  host.remove();
});
