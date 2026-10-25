import { html, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { defineElement, hostStyles, visuallyHiddenStyles } from '@elo-ui/core';
import { ValueControl } from '../shared/value-control.js';
import { fieldStyles, textControlStyles } from '../shared/form-control.styles.js';

export type InputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * A single-line text field with a built-in label, hint, and error.
 *
 * @tag elo-input
 *
 * @slot label - Rich label content, instead of the `label` attribute.
 * @slot hint - Rich hint content, instead of the `hint` attribute.
 * @slot start - Content before the text, such as an icon.
 * @slot end - Content after the text, such as an icon or unit.
 *
 * @csspart label - The label.
 * @csspart control - The bordered box around the input.
 * @csspart input - The native input.
 * @csspart hint - The hint text.
 * @csspart error - The error text.
 *
 * @fires input - When the value changes as the user types.
 * @fires change - When the user commits a change, usually on blur.
 */
export class EloInput extends ValueControl {
  static override styles = [hostStyles, visuallyHiddenStyles, fieldStyles, textControlStyles];

  /** Input type. */
  @property() accessor type: InputType = 'text';

  /** Control size. Heights also follow the active density. */
  @property({ reflect: true }) accessor size: InputSize = 'md';

  /** Placeholder text. Don't use it in place of a label. */
  @property() accessor placeholder: string | undefined;

  /** Prevents editing while keeping the value focusable and submittable. */
  @property({ type: Boolean, reflect: true }) accessor readonly = false;

  /** Minimum length, validated natively. */
  @property({ type: Number, attribute: 'minlength' }) accessor minLength: number | undefined;

  /** Maximum length. */
  @property({ type: Number, attribute: 'maxlength' }) accessor maxLength: number | undefined;

  /** Minimum value, for `type="number"`. */
  @property() accessor min: string | undefined;

  /** Maximum value, for `type="number"`. */
  @property() accessor max: string | undefined;

  /** Step, for `type="number"`. */
  @property() accessor step: string | undefined;

  /** Regular expression the value must match. */
  @property() accessor pattern: string | undefined;

  /** Browser autofill hint, such as `email` or `current-password`. */
  @property() accessor autocomplete: string | undefined;

  /** Virtual keyboard hint, such as `numeric`. */
  @property() accessor inputmode: string | undefined;

  @query('input') private accessor input: HTMLInputElement | null = null;

  protected get validationTarget(): HTMLInputElement | null {
    return this.input;
  }

  /** Selects all text in the input. */
  select(): void {
    this.input?.select();
  }

  override render(): TemplateResult {
    const error = this.visibleError;
    return html`<div class="field">
      ${this.renderLabel()}
      <div
        part="control"
        class=${classMap({ control: true, invalid: Boolean(error), disabled: this.isDisabled })}
      >
        <slot name="start"></slot>
        <input
          id="control"
          part="input"
          type=${this.type}
          .value=${live(this.value)}
          name=${ifDefined(this.name)}
          placeholder=${ifDefined(this.placeholder)}
          minlength=${ifDefined(this.minLength)}
          maxlength=${ifDefined(this.maxLength)}
          min=${ifDefined(this.min)}
          max=${ifDefined(this.max)}
          step=${ifDefined(this.step)}
          pattern=${ifDefined(this.pattern)}
          autocomplete=${ifDefined(this.autocomplete as AutoFill | undefined)}
          inputmode=${ifDefined(this.inputmode)}
          ?required=${this.required}
          ?disabled=${this.isDisabled}
          ?readonly=${this.readonly}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-invalid=${error ? 'true' : 'false'}
          @input=${this.onNativeInput}
          @change=${this.onNativeChange}
        />
        <slot name="end"></slot>
      </div>
      ${this.renderHelpText()}
    </div>`;
  }
}

defineElement('elo-input', EloInput);

declare global {
  interface HTMLElementTagNameMap {
    'elo-input': EloInput;
  }
}
