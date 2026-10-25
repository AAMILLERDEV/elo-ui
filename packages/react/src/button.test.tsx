import '@elo-ui/core/theme.css';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EloButton as EloButtonElement } from '@elo-ui/components';
import { EloButton } from './index.js';

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

describe('<EloButton> (React)', () => {
  it('renders elo-button and sets props as element properties', async () => {
    const view = render(
      <EloButton variant="primary" size="lg" loading>
        Save
      </EloButton>,
    );
    const el = view.querySelector<EloButtonElement>('elo-button')!;
    await el.updateComplete;
    expect(el.variant).toBe('primary');
    expect(el.size).toBe('lg');
    expect(el.loading).toBe(true);
    expect(el.textContent).toBe('Save');
  });

  it('updates props on re-render and forwards refs to the element', async () => {
    const ref = { current: null as EloButtonElement | null };
    function Toggle() {
      const [disabled, setDisabled] = useState(false);
      return (
        <>
          <EloButton ref={ref} disabled={disabled}>
            Target
          </EloButton>
          <button onClick={() => setDisabled(true)}>Disable</button>
        </>
      );
    }
    const view = render(<Toggle />);
    expect(ref.current?.tagName).toBe('ELO-BUTTON');

    act(() => view.querySelector<HTMLButtonElement>('button:not([part])')!.click());
    expect(ref.current!.disabled).toBe(true);
  });

  it('fires onClick, and not while disabled', async () => {
    const onClick = vi.fn();
    const view = render(
      <>
        <EloButton id="on" onClick={onClick}>
          On
        </EloButton>
        <EloButton id="off" disabled onClick={onClick}>
          Off
        </EloButton>
      </>,
    );
    const on = view.querySelector<EloButtonElement>('#on')!;
    const off = view.querySelector<EloButtonElement>('#off')!;
    await Promise.all([on.updateComplete, off.updateComplete]);

    act(() => on.click());
    act(() => off.click());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('submits a React form with name and value', async () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const native = event.nativeEvent as SubmitEvent;
      return Object.fromEntries(new FormData(event.currentTarget, native.submitter));
    });
    const view = render(
      <form onSubmit={onSubmit}>
        <input name="title" defaultValue="Draft" />
        <EloButton type="submit" name="intent" value="publish">
          Publish
        </EloButton>
      </form>,
    );
    const el = view.querySelector<EloButtonElement>('elo-button')!;
    await el.updateComplete;

    act(() => el.click());
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.results[0]!.value).toEqual({ title: 'Draft', intent: 'publish' });
  });
});
