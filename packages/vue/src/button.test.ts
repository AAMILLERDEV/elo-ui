import '@elo-ui/core/theme.css';
import '@elo-ui/components/button';
import { createApp, nextTick, ref, type App } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EloButton } from '@elo-ui/components';
import { eloCompilerOptions, eloTags } from './index.js';

let app: App | undefined;
let host: HTMLElement | undefined;

afterEach(() => {
  app?.unmount();
  host?.remove();
});

function mount(component: Parameters<typeof createApp>[0]): HTMLElement {
  host = document.createElement('div');
  document.body.append(host);
  app = createApp(component);
  Object.assign(app.config.compilerOptions, eloCompilerOptions);
  const warn = vi.spyOn(console, 'warn');
  app.mount(host);
  // Vue warns "Failed to resolve component" if isCustomElement isn't applied.
  const unresolved = warn.mock.calls.filter(([msg]) => String(msg).includes('resolve component'));
  expect(unresolved).toEqual([]);
  warn.mockRestore();
  return host;
}

describe('elo-button (Vue)', () => {
  it('lists the generated tags', () => {
    expect(eloTags).toContain('elo-button');
  });

  it('binds props as element properties and reacts to changes', async () => {
    const loading = ref(false);
    const view = mount({
      setup: () => ({ loading }),
      template: `<elo-button variant="danger" :loading="loading">Delete</elo-button>`,
    });
    const el = view.querySelector<EloButton>('elo-button')!;
    await el.updateComplete;
    expect(el.variant).toBe('danger');
    expect(el.loading).toBe(false);

    loading.value = true;
    await nextTick();
    expect(el.loading).toBe(true);
  });

  it('handles @click, and not while disabled', async () => {
    const onClick = vi.fn();
    const view = mount({
      setup: () => ({ onClick }),
      template: `
        <elo-button id="on" @click="onClick">On</elo-button>
        <elo-button id="off" disabled @click="onClick">Off</elo-button>
      `,
    });
    const on = view.querySelector<EloButton>('#on')!;
    const off = view.querySelector<EloButton>('#off')!;
    await Promise.all([on.updateComplete, off.updateComplete]);

    on.click();
    off.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('submits a Vue form with name and value', async () => {
    const onSubmit = vi.fn((event: SubmitEvent) =>
      Object.fromEntries(new FormData(event.target as HTMLFormElement, event.submitter)),
    );
    const view = mount({
      setup: () => ({ onSubmit }),
      template: `
        <form @submit.prevent="onSubmit">
          <input name="title" value="Draft" />
          <elo-button type="submit" name="intent" value="publish">Publish</elo-button>
        </form>
      `,
    });
    const el = view.querySelector<EloButton>('elo-button')!;
    await el.updateComplete;

    el.click();
    expect(onSubmit.mock.results[0]!.value).toEqual({ title: 'Draft', intent: 'publish' });
  });
});
