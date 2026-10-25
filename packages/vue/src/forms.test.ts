import '@elo-ui/core/theme.css';
import '@elo-ui/components';
import { createApp, nextTick, ref, type App } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { EloCheckbox, EloInput, EloRadioGroup, EloSelect } from '@elo-ui/components';
import { eloCompilerOptions } from './index.js';

let app: App | undefined;
let host: HTMLElement | undefined;

afterEach(() => {
  app?.unmount();
  host?.remove();
});

async function mount(template: string, state: Record<string, unknown>): Promise<HTMLElement> {
  host = document.createElement('div');
  document.body.append(host);
  app = createApp({ setup: () => state, template });
  Object.assign(app.config.compilerOptions, eloCompilerOptions);
  app.mount(host);
  await Promise.all(
    [...host.querySelectorAll('*')].map(
      (el) => (el as { updateComplete?: unknown }).updateComplete,
    ),
  );
  return host;
}

describe('Vue v-model', () => {
  it('binds elo-input value both ways', async () => {
    const name = ref('Ada');
    const view = await mount('<elo-input label="Name" v-model="name"></elo-input>', { name });
    const el = view.querySelector<EloInput>('elo-input')!;
    expect(el.value).toBe('Ada');

    await userEvent.type(el.shadowRoot!.querySelector('input')!, ' L');
    expect(name.value).toBe('Ada L');

    name.value = 'Grace';
    await nextTick();
    expect(el.value).toBe('Grace');
  });

  it('binds elo-select and elo-radio-group values', async () => {
    const role = ref('viewer');
    const plan = ref('yearly');
    const view = await mount(
      `<elo-select label="Role" v-model="role">
         <option value="admin">Admin</option><option value="viewer">Viewer</option>
       </elo-select>
       <elo-radio-group label="Plan" v-model="plan">
         <elo-radio value="monthly">Monthly</elo-radio><elo-radio value="yearly">Yearly</elo-radio>
       </elo-radio-group>`,
      { role, plan },
    );
    const select = view.querySelector<EloSelect>('elo-select')!;
    const group = view.querySelector<EloRadioGroup>('elo-radio-group')!;
    expect(select.value).toBe('viewer');
    expect(group.value).toBe('yearly');

    await userEvent.selectOptions(select.shadowRoot!.querySelector('select')!, 'admin');
    expect(role.value).toBe('admin');
    // Vue sets `value` as a property, so find the radio by its label rather than [value].
    const monthly = [...group.querySelectorAll('elo-radio')].find(
      (r) => r.textContent === 'Monthly',
    );
    await userEvent.click(monthly!);
    expect(plan.value).toBe('monthly');
  });

  it('binds elo-checkbox and elo-switch checked state, not value', async () => {
    const subscribe = ref(true);
    const dark = ref(false);
    const view = await mount(
      `<elo-checkbox label="Subscribe" value="yes" v-model="subscribe"></elo-checkbox>
       <elo-switch label="Dark mode" v-model="dark"></elo-switch>`,
      { subscribe, dark },
    );
    const box = view.querySelector<EloCheckbox>('elo-checkbox')!;
    const toggle = view.querySelector<EloCheckbox>('elo-switch')!;
    expect(box.checked).toBe(true);
    expect(box.value).toBe('yes');

    await userEvent.click(box.shadowRoot!.querySelector('input')!);
    expect(subscribe.value).toBe(false);
    await userEvent.click(toggle.shadowRoot!.querySelector('input')!);
    expect(dark.value).toBe(true);

    subscribe.value = true;
    await nextTick();
    expect(box.checked).toBe(true);
  });

  it('collects checked values into an array', async () => {
    const tags = ref(['a']);
    const view = await mount(
      `<elo-checkbox label="A" value="a" v-model="tags"></elo-checkbox>
       <elo-checkbox label="B" value="b" v-model="tags"></elo-checkbox>`,
      { tags },
    );
    const [a, b] = view.querySelectorAll<EloCheckbox>('elo-checkbox');
    expect(a!.checked).toBe(true);
    expect(b!.checked).toBe(false);

    await userEvent.click(b!.shadowRoot!.querySelector('input')!);
    expect(tags.value).toEqual(['a', 'b']);
  });
});
