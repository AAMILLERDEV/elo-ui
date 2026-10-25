import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import { EloInput } from './input.js';

const native = (el: EloInput) => el.shadowRoot!.querySelector('input')!;

describe('elo-input', () => {
  it('labels the native input and describes it with the hint', async () => {
    await fixture('<elo-input label="Email" hint="We never share it."></elo-input>');
    const input = page.getByRole('textbox', { name: 'Email' });
    await expect.element(input).toBeInTheDocument();
    await expect.element(input).toHaveAccessibleDescription('We never share it.');
  });

  it('supports rich label and hint slots', async () => {
    await fixture(`
      <elo-input>
        <span slot="label">Work <b>email</b></span>
        <span slot="hint">Use your company address.</span>
      </elo-input>
    `);
    const input = page.getByRole('textbox', { name: 'Work email' });
    await expect.element(input).toHaveAccessibleDescription('Use your company address.');
  });

  it('keeps a hidden label accessible', async () => {
    const el = await fixture<EloInput>('<elo-input label="Search" hide-label></elo-input>');
    await expect.element(page.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
    expect(el.shadowRoot!.querySelector('label')!.classList).toContain('visually-hidden');
  });

  it('updates value as the user types and emits input and change', async () => {
    const root = await fixture<HTMLElement>(
      '<div><elo-input label="Name"></elo-input><button>Next</button></div>',
    );
    const el = root.querySelector('elo-input')!;
    const onInput = vi.fn(() => el.value);
    const onChange = vi.fn();
    el.addEventListener('input', onInput);
    el.addEventListener('change', onChange);

    await userEvent.type(page.getByRole('textbox', { name: 'Name' }), 'Ada');
    expect(el.value).toBe('Ada');
    expect(onInput).toHaveBeenCalledTimes(3);
    expect(onInput.mock.results.at(-1)!.value).toBe('Ada');

    await userEvent.tab();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('submits its value and resets to the value attribute', async () => {
    const form = await fixture<HTMLFormElement>(`
      <form><elo-input label="Title" name="title" value="Draft"></elo-input></form>
    `);
    const el = form.querySelector('elo-input')!;
    expect(new FormData(form).get('title')).toBe('Draft');

    el.value = 'Final';
    await el.updateComplete;
    expect(new FormData(form).get('title')).toBe('Final');

    form.reset();
    await el.updateComplete;
    expect(el.value).toBe('Draft');
    expect(native(el).value).toBe('Draft');
  });

  it('keeps a value set before first render over the value attribute', async () => {
    const el = document.createElement('elo-input');
    el.setAttribute('label', 'Name');
    el.setAttribute('value', 'Default');
    el.value = 'Set by code';
    document.body.append(el);
    await el.updateComplete;
    expect(el.value).toBe('Set by code');
    expect(native(el).value).toBe('Set by code');
    el.remove();
  });

  describe('validation', () => {
    it('mirrors native validity without showing an error before the user is done', async () => {
      const el = await fixture<EloInput>(
        '<elo-input label="Email" type="email" required></elo-input>',
      );
      expect(el.validity.valueMissing).toBe(true);
      expect(el.checkValidity()).toBe(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.error')).toBeNull();
      expect(native(el).getAttribute('aria-invalid')).toBe('false');
    });

    it('shows the native message after the user leaves the field', async () => {
      const root = await fixture<HTMLElement>(
        '<div><elo-input label="Email" required></elo-input><button>Next</button></div>',
      );
      const el = root.querySelector('elo-input')!;
      const input = page.getByRole('textbox', { name: 'Email' });

      await userEvent.click(input);
      await userEvent.tab();
      await el.updateComplete;

      await expect.element(input).toBeInvalid();
      expect(el.shadowRoot!.querySelector('.error')!.textContent).toBe(el.validationMessage);
      await expect.element(input).toHaveAccessibleDescription(el.validationMessage);
    });

    it('shows errors after a submit attempt and blocks submission', async () => {
      const form = await fixture<HTMLFormElement>(`
        <form><elo-input label="Code" name="code" pattern="[0-9]{4}" value="12"></elo-input></form>
      `);
      const el = form.querySelector('elo-input')!;
      const onSubmit = vi.fn((event: Event) => event.preventDefault());
      form.addEventListener('submit', onSubmit);

      form.requestSubmit();
      await el.updateComplete;
      expect(onSubmit).not.toHaveBeenCalled();
      expect(el.validity.patternMismatch).toBe(true);
      expect(el.shadowRoot!.querySelector('.error')).not.toBeNull();
    });

    it('shows the error attribute without blocking submission', async () => {
      const el = await fixture<EloInput>(
        '<elo-input label="Username" error="Already taken"></elo-input>',
      );
      const input = page.getByRole('textbox', { name: 'Username' });
      await expect.element(input).toBeInvalid();
      await expect.element(input).toHaveAccessibleDescription('Already taken');
      expect(el.checkValidity()).toBe(true);
    });

    it('supports setCustomValidity', async () => {
      const el = await fixture<EloInput>('<elo-input label="Name"></elo-input>');
      el.setCustomValidity('Pick another name');
      expect(el.validity.customError).toBe(true);
      expect(el.reportValidity()).toBe(false);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.error')!.textContent).toBe('Pick another name');

      el.setCustomValidity('');
      expect(el.checkValidity()).toBe(true);
    });

    it('clears touched state on form reset', async () => {
      const form = await fixture<HTMLFormElement>(
        '<form><elo-input label="Name" required></elo-input></form>',
      );
      const el = form.querySelector('elo-input')!;
      el.reportValidity();
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.error')).not.toBeNull();

      form.reset();
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.error')).toBeNull();
    });
  });

  it('is disabled directly or by a disabled fieldset', async () => {
    const form = await fixture<HTMLFormElement>(`
      <form>
        <elo-input label="A" disabled></elo-input>
        <fieldset disabled><elo-input label="B"></elo-input></fieldset>
      </form>
    `);
    await expect.element(page.getByRole('textbox', { name: 'A' })).toBeDisabled();
    await expect.element(page.getByRole('textbox', { name: 'B' })).toBeDisabled();
    expect(form).toBeTruthy();
  });

  it('warns when it has no label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await fixture('<elo-input></elo-input>');
    expect(warn.mock.calls.some(([msg]) => String(msg).includes('needs a `label`'))).toBe(true);
    warn.mockRestore();
  });

  describe('a11y (axe)', () => {
    const markup = `
      <div>
        <elo-input label="Name" hint="Your full name"></elo-input>
        <elo-input label="Email" type="email" required placeholder="you@example.com"></elo-input>
        <elo-input label="Username" error="Already taken"></elo-input>
        <elo-input label="Disabled" disabled value="Locked"></elo-input>
        <elo-input label="Search" hide-label type="search"></elo-input>
      </div>
    `;

    for (const theme of ['light', 'dark'] as const) {
      it(`has no violations in the ${theme} theme`, async () => {
        const root = await fixture<HTMLElement>(markup);
        root.dataset.eloTheme = theme;
        root.style.background = 'var(--elo-color-bg)';
        await expectNoA11yViolations(root);
      });
    }
  });
});
