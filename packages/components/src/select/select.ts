import { css, html, type PropertyValues, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineElement, hostStyles, visuallyHiddenStyles } from '@elo-ui/core';
import { ValueControl } from '../shared/value-control.js';
import { fieldStyles, textControlStyles } from '../shared/form-control.styles.js';

export type SelectSize = 'sm' | 'md' | 'lg';

/**
 * A dropdown built on the native `<select>`, so keyboard, mobile pickers, and screen readers work natively.
 *
 * @tag elo-select
 *
 * @slot - `<option>` and `<optgroup>` elements.
 * @slot label - Rich label content, instead of the `label` attribute.
 * @slot hint - Rich hint content, instead of the `hint` attribute.
 *
 * @csspart label - The label.
 * @csspart control - The bordered box around the select.
 * @csspart select - The native select.
 * @csspart hint - The hint text.
 * @csspart error - The error text.
 *
 * @fires input - When the user picks an option.
 * @fires change - When the user picks an option.
 */
export class EloSelect extends ValueControl {
  static override styles = [
    hostStyles,
    visuallyHiddenStyles,
    fieldStyles,
    textControlStyles,
    css`
      .control {
        padding: 0;
      }

      select {
        appearance: none;
        padding-inline: var(--_padding-x) calc(var(--_padding-x) + 1.25em);
        cursor: pointer;
      }

      .chevron {
        position: absolute;
        inset-inline-end: var(--_padding-x);
        width: 1em;
        height: 1em;
        color: var(--elo-color-fg-muted);
        pointer-events: none;
      }

      option {
        color: var(--elo-color-fg);
        background: var(--elo-color-surface);
      }
    `,
  ];

  /** Control size. Heights also follow the active density. */
  @property({ reflect: true }) accessor size: SelectSize = 'md';

  /** Text for an empty first option, shown until the user picks one. */
  @property() accessor placeholder: string | undefined;

  @query('select') private accessor select: HTMLSelectElement | null = null;

  #observer = new MutationObserver(() => this.#syncOptions());

  protected get validationTarget(): HTMLSelectElement | null {
    return this.select;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#observer.disconnect();
  }

  protected override firstUpdated(changed: PropertyValues<this>): void {
    // With no value attribute, start from the light DOM's selected option, like a native select.
    if (!this.hasAttribute('value') && !this.placeholder) {
      const selected =
        this.querySelector<HTMLOptionElement>('option[selected]') ??
        this.querySelector<HTMLOptionElement>('option');
      this.defaultValue = selected?.value ?? '';
    }
    this.#syncOptions();
    super.firstUpdated(changed);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('placeholder')) this.#syncOptions();
    else if (this.select && this.select.value !== this.value) this.select.value = this.value;
    super.updated(changed);
  }

  // Native selects can't slot options, so mirror the light DOM into the inner select.
  #syncOptions(): void {
    const select = this.select;
    if (!select) return;
    const placeholder = this.placeholder ? new Option(this.placeholder, '') : null;
    if (placeholder) {
      placeholder.disabled = true;
      placeholder.hidden = true;
    }
    select.replaceChildren(
      ...(placeholder ? [placeholder] : []),
      ...[...this.children]
        .filter((el) => el instanceof HTMLOptionElement || el instanceof HTMLOptGroupElement)
        .map((el) => el.cloneNode(true)),
    );
    select.value = this.value;
    this.updateValidity();
  }

  override render(): TemplateResult {
    const error = this.visibleError;
    return html`<div class="field">
      ${this.renderLabel()}
      <div
        part="control"
        class=${classMap({ control: true, invalid: Boolean(error), disabled: this.isDisabled })}
      >
        <select
          id="control"
          part="select"
          name=${ifDefined(this.name)}
          ?required=${this.required}
          ?disabled=${this.isDisabled}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-invalid=${error ? 'true' : 'false'}
          @input=${this.onNativeInput}
          @change=${this.onNativeChange}
        ></select>
        <svg
          class="chevron"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <slot hidden></slot>
      ${this.renderHelpText()}
    </div>`;
  }
}

defineElement('elo-select', EloSelect);

declare global {
  interface HTMLElementTagNameMap {
    'elo-select': EloSelect;
  }
}
