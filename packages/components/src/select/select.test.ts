import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import type { EloSelect } from './select.js';
import './select.js';

const options = `
  <option value="admin">Admin</option>
  <option value="editor" selected>Editor</option>
  <optgroup label="Limited"><option value="viewer">Viewer</option></optgroup>
`;

const native = (el: EloSelect) => el.shadowRoot!.querySelector('select')!;

describe('elo-select', () => {
  it('is a labelled combobox with the light DOM options', async () => {
    const el = await fixture<EloSelect>(
      `<elo-select label="Role" hint="Controls access">${options}</elo-select>`,
    );
    const select = page.getByRole('combobox', { name: 'Role' });
    await expect.element(select).toHaveAccessibleDescription('Controls access');
    expect([...native(el).options].map((o) => o.value)).toEqual(['admin', 'editor', 'viewer']);
    expect(el.value).toBe('editor');
  });

  it('uses the value attribute over the selected option', async () => {
    const el = await fixture<EloSelect>(
      `<elo-select label="Role" value="viewer">${options}</elo-select>`,
    );
    expect(el.value).toBe('viewer');
    expect(native(el).value).toBe('viewer');
  });

  it('updates value and emits input and change when the user picks', async () => {
    const el = await fixture<EloSelect>(`<elo-select label="Role">${options}</elo-select>`);
    const onChange = vi.fn(() => el.value);
    el.addEventListener('change', onChange);

    await userEvent.selectOptions(page.getByRole('combobox', { name: 'Role' }), 'admin');
    expect(el.value).toBe('admin');
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.results[0]!.value).toBe('admin');
  });

  it('mirrors option changes made after render', async () => {
    const el = await fixture<EloSelect>(`<elo-select label="Role">${options}</elo-select>`);
    el.append(new Option('Owner', 'owner'));
    el.querySelector('option[value="admin"]')!.textContent = 'Administrator';
    await new Promise((resolve) => setTimeout(resolve));
    const labels = [...native(el).options].map((o) => o.text);
    expect(labels).toEqual(['Administrator', 'Editor', 'Viewer', 'Owner']);
  });

  it('requires a choice when it has a placeholder', async () => {
    const form = await fixture<HTMLFormElement>(`
      <form><elo-select label="Role" name="role" placeholder="Choose a role" required>${options}</elo-select></form>
    `);
    const el = form.querySelector<EloSelect>('elo-select')!;
    expect(el.value).toBe('');
    expect(native(el).options[0]!.text).toBe('Choose a role');
    expect(el.validity.valueMissing).toBe(true);

    el.value = 'admin';
    await el.updateComplete;
    expect(el.checkValidity()).toBe(true);
    expect(new FormData(form).get('role')).toBe('admin');

    form.reset();
    await el.updateComplete;
    expect(el.value).toBe('');
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`has no axe violations in the ${theme} theme`, async () => {
      const root = await fixture<HTMLElement>(`
        <div data-elo-theme="${theme}" style="background: var(--elo-color-bg)">
          <elo-select label="Role">${options}</elo-select>
          <elo-select label="Team" placeholder="Choose" error="Required">${options}</elo-select>
        </div>
      `);
      await expectNoA11yViolations(root);
    });
  }
});
