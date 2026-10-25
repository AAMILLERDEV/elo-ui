import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { fixture } from '../../test/fixture.js';
import { EloButton } from './button.js';

const control = (el: EloButton) => el.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;

describe('elo-button', () => {
  it('registers and renders a native button with type="button"', async () => {
    const el = await fixture<EloButton>('<elo-button>Save</elo-button>');
    expect(el).toBeInstanceOf(EloButton);
    expect(control(el).tagName).toBe('BUTTON');
    expect(control(el).getAttribute('type')).toBe('button');
  });

  it('reflects variant and size with defaults', async () => {
    const el = await fixture<EloButton>('<elo-button>Save</elo-button>');
    expect(el.getAttribute('variant')).toBe('secondary');
    expect(el.getAttribute('size')).toBe('md');

    el.variant = 'primary';
    el.size = 'lg';
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('primary');
    expect(el.getAttribute('size')).toBe('lg');
  });

  describe('activation', () => {
    it('fires click from mouse, Enter, and Space', async () => {
      const el = await fixture<EloButton>('<elo-button>Save</elo-button>');
      const onClick = vi.fn();
      el.addEventListener('click', onClick);

      await userEvent.click(el);
      el.focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('is reachable with Tab and focuses the inner control', async () => {
      const el = await fixture<EloButton>('<elo-button>Save</elo-button>');
      await userEvent.tab();
      expect(document.activeElement).toBe(el);
      expect(el.shadowRoot!.activeElement).toBe(control(el));
    });

    it('does not fire click when disabled', async () => {
      const el = await fixture<EloButton>('<elo-button disabled>Save</elo-button>');
      const onClick = vi.fn();
      el.addEventListener('click', onClick);

      el.click();
      control(el).dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
      expect(onClick).not.toHaveBeenCalled();
      expect(control(el).hasAttribute('disabled')).toBe(true);
    });

    it('stays focusable but ignores activation while loading', async () => {
      const el = await fixture<EloButton>('<elo-button loading>Save</elo-button>');
      const onClick = vi.fn();
      el.addEventListener('click', onClick);

      el.focus();
      expect(el.shadowRoot!.activeElement).toBe(control(el));
      await userEvent.keyboard('{Enter}');
      el.click();
      expect(onClick).not.toHaveBeenCalled();
      expect(control(el).getAttribute('aria-disabled')).toBe('true');
      expect(el.shadowRoot!.querySelector('[part="spinner"]')).not.toBeNull();
    });
  });

  describe('forms', () => {
    it('submits its form with name and value, and is the submitter', async () => {
      const form = await fixture<HTMLFormElement>(`
        <form>
          <input name="title" value="Draft" />
          <elo-button type="submit" name="intent" value="publish">Publish</elo-button>
        </form>
      `);
      const el = form.querySelector('elo-button')!;
      const submitted = new Promise<FormData>((resolve) => {
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          resolve(new FormData(form, event.submitter));
        });
      });

      el.click();
      const data = await submitted;
      expect(data.get('title')).toBe('Draft');
      expect(data.get('intent')).toBe('publish');
      expect(form.querySelectorAll('button')).toHaveLength(0);
    });

    it('runs native validation before submitting', async () => {
      const form = await fixture<HTMLFormElement>(`
        <form>
          <input name="email" required />
          <elo-button type="submit">Send</elo-button>
        </form>
      `);
      const onSubmit = vi.fn((event: Event) => event.preventDefault());
      form.addEventListener('submit', onSubmit);

      form.querySelector('elo-button')!.click();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('resets its form', async () => {
      const form = await fixture<HTMLFormElement>(`
        <form>
          <input name="title" value="Original" />
          <elo-button type="reset">Reset</elo-button>
        </form>
      `);
      const input = form.querySelector('input')!;
      input.value = 'Changed';

      form.querySelector('elo-button')!.click();
      expect(input.value).toBe('Original');
    });

    it('does nothing in a form when type="button"', async () => {
      const form = await fixture<HTMLFormElement>(`
        <form><elo-button>Cancel</elo-button></form>
      `);
      const onSubmit = vi.fn((event: Event) => event.preventDefault());
      form.addEventListener('submit', onSubmit);

      form.querySelector('elo-button')!.click();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('is disabled by a disabled fieldset', async () => {
      const form = await fixture<HTMLFormElement>(`
        <form><fieldset disabled><elo-button type="submit">Save</elo-button></fieldset></form>
      `);
      const el = form.querySelector('elo-button')!;
      await el.updateComplete;
      expect(control(el).hasAttribute('disabled')).toBe(true);
      expect(el.form).toBe(form);
    });
  });

  describe('link mode', () => {
    it('renders a native link when href is set', async () => {
      const el = await fixture<EloButton>(
        '<elo-button href="/docs" target="_blank">Docs</elo-button>',
      );
      const link = control(el);
      expect(link.tagName).toBe('A');
      expect(link.getAttribute('href')).toBe('/docs');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('removes href and marks the link disabled when disabled', async () => {
      const el = await fixture<EloButton>('<elo-button href="/docs" disabled>Docs</elo-button>');
      const link = control(el);
      expect(link.hasAttribute('href')).toBe(false);
      expect(link.getAttribute('role')).toBe('link');
      expect(link.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('accessible name', () => {
    it('uses label as the accessible name for icon-only buttons', async () => {
      const el = await fixture<EloButton>(
        '<elo-button label="Close"><svg slot="start" aria-hidden="true" viewBox="0 0 16 16"></svg></elo-button>',
      );
      expect(control(el).getAttribute('aria-label')).toBe('Close');
      expect(control(el).classList.contains('icon-only')).toBe(true);
    });

    it('warns when there is no text and no label', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await fixture<EloButton>(
        '<elo-button><svg slot="start" aria-hidden="true" viewBox="0 0 16 16"></svg></elo-button>',
      );
      expect(warn).toHaveBeenCalledOnce();
      warn.mockRestore();
    });
  });

  describe('a11y (axe)', () => {
    const markup = `
      <div>
        <elo-button variant="primary">Primary</elo-button>
        <elo-button>Secondary</elo-button>
        <elo-button variant="ghost">Ghost</elo-button>
        <elo-button variant="danger">Delete</elo-button>
        <elo-button loading>Saving</elo-button>
        <elo-button href="/docs">Link</elo-button>
        <elo-button label="Settings"><svg slot="start" aria-hidden="true" viewBox="0 0 16 16"></svg></elo-button>
      </div>
    `;

    it('has no violations in the light theme', async () => {
      const root = await fixture<HTMLElement>(markup);
      root.dataset.eloTheme = 'light';
      root.style.background = 'var(--elo-color-bg)';
      await expectNoA11yViolations(root);
    });

    it('has no violations in the dark theme', async () => {
      const root = await fixture<HTMLElement>(markup);
      root.dataset.eloTheme = 'dark';
      root.style.background = 'var(--elo-color-bg)';
      await expectNoA11yViolations(root);
    });

    it('has no violations in compact density', async () => {
      const root = await fixture<HTMLElement>(markup);
      root.dataset.eloDensity = 'compact';
      await expectNoA11yViolations(root);
    });
  });
});
