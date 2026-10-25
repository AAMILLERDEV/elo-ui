import { css, html, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { defineElement, hostStyles, visuallyHiddenStyles } from '@elo-ui/core';
import { ValueControl } from '../shared/value-control.js';
import { fieldStyles, textControlStyles } from '../shared/form-control.styles.js';

export type TextareaResize = 'vertical' | 'none';

/**
 * A multi-line text field with a built-in label, hint, and error.
 *
 * @tag elo-textarea
 *
 * @slot label - Rich label content, instead of the `label` attribute.
 * @slot hint - Rich hint content, instead of the `hint` attribute.
 *
 * @csspart label - The label.
 * @csspart control - The bordered box around the textarea.
 * @csspart textarea - The native textarea.
 * @csspart hint - The hint text.
 * @csspart error - The error text.
 *
 * @fires input - When the value changes as the user types.
 * @fires change - When the user commits a change, usually on blur.
 */
export class EloTextarea extends ValueControl {
  static override styles = [
    hostStyles,
    visuallyHiddenStyles,
    fieldStyles,
    textControlStyles,
    css`
      .control {
        align-items: stretch;
        padding: var(--elo-space-2) var(--_padding-x);
      }

      textarea {
        min-height: calc(var(--_height) * 2);
        resize: vertical;
        line-height: var(--elo-line-height);
      }

      :host([resize='none']) textarea {
        resize: none;
      }
    `,
  ];

  /** Visible text lines. */
  @property({ type: Number }) accessor rows = 3;

  /** Whether the user can resize the textarea vertically. */
  @property({ reflect: true }) accessor resize: TextareaResize = 'vertical';

  /** Placeholder text. Don't use it in place of a label. */
  @property() accessor placeholder: string | undefined;

  /** Prevents editing while keeping the value focusable and submittable. */
  @property({ type: Boolean, reflect: true }) accessor readonly = false;

  /** Minimum length, validated natively. */
  @property({ type: Number, attribute: 'minlength' }) accessor minLength: number | undefined;

  /** Maximum length. */
  @property({ type: Number, attribute: 'maxlength' }) accessor maxLength: number | undefined;

  @query('textarea') private accessor textarea: HTMLTextAreaElement | null = null;

  protected get validationTarget(): HTMLTextAreaElement | null {
    return this.textarea;
  }

  override render(): TemplateResult {
    const error = this.visibleError;
    return html`<div class="field">
      ${this.renderLabel()}
      <div
        part="control"
        class=${classMap({ control: true, invalid: Boolean(error), disabled: this.isDisabled })}
      >
        <textarea
          id="control"
          part="textarea"
          rows=${this.rows}
          .value=${live(this.value)}
          name=${ifDefined(this.name)}
          placeholder=${ifDefined(this.placeholder)}
          minlength=${ifDefined(this.minLength)}
          maxlength=${ifDefined(this.maxLength)}
          ?required=${this.required}
          ?disabled=${this.isDisabled}
          ?readonly=${this.readonly}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-invalid=${error ? 'true' : 'false'}
          @input=${this.onNativeInput}
          @change=${this.onNativeChange}
        ></textarea>
      </div>
      ${this.renderHelpText()}
    </div>`;
  }
}

defineElement('elo-textarea', EloTextarea);

declare global {
  interface HTMLElementTagNameMap {
    'elo-textarea': EloTextarea;
  }
}
