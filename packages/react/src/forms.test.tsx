import '@elo-ui/core/theme.css';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type {
  EloCheckbox as EloCheckboxElement,
  EloInput as EloInputElement,
} from '@elo-ui/components';
import { EloCheckbox, EloInput } from './index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let container: HTMLElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

function render(ui: React.ReactNode): HTMLElement {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root!.render(ui));
  return container;
}

describe('React form controls', () => {
  it('supports controlled inputs and checkboxes', async () => {
    const seen: { name?: string; subscribe?: boolean } = {};
    function Form() {
      const [name, setName] = useState('Ada');
      const [subscribe, setSubscribe] = useState(false);
      seen.name = name;
      seen.subscribe = subscribe;
      return (
        <>
          <EloInput
            label="Name"
            value={name}
            onInput={(e) => setName((e.target as EloInputElement).value)}
          />
          <EloCheckbox
            label="Subscribe"
            checked={subscribe}
            onChange={(e) => setSubscribe((e.target as EloCheckboxElement).checked)}
          />
        </>
      );
    }

    const view = render(<Form />);
    const input = view.querySelector<EloInputElement>('elo-input')!;
    const box = view.querySelector<EloCheckboxElement>('elo-checkbox')!;
    await Promise.all([input.updateComplete, box.updateComplete]);
    expect(input.value).toBe('Ada');

    await userEvent.type(input.shadowRoot!.querySelector('input')!, ' L');
    expect(seen.name).toBe('Ada L');

    await userEvent.click(box.shadowRoot!.querySelector('input')!);
    expect(seen.subscribe).toBe(true);
    expect(box.checked).toBe(true);
  });
});
