import '@elo-ui/core/theme.css';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { EloButton, EloDropdown, EloMenuItem } from './index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('maps custom events to on* props', async () => {
  const onSelect = vi.fn((e: CustomEvent<{ value: string }>) => e.detail.value);
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  act(() =>
    root.render(
      <EloDropdown onEloSelect={onSelect}>
        <EloButton slot="trigger">Actions</EloButton>
        <EloMenuItem value="edit">Edit</EloMenuItem>
      </EloDropdown>,
    ),
  );

  await userEvent.click(container.querySelector('elo-button')!);
  await userEvent.click(container.querySelector('elo-menu-item')!);
  expect(onSelect.mock.results[0]!.value).toBe('edit');

  act(() => root.unmount());
  container.remove();
});
