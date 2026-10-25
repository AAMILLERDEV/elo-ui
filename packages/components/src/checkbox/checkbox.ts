import { css, html, svg, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { defineElement, hostStyles, visuallyHiddenStyles } from '@elo-ui/core';
import { CheckControl, choiceStyles } from '../shared/check-control.js';
import { fieldStyles } from '../shared/form-control.styles.js';

/**
 * A checkbox with a built-in label, hint, and error. Supports an indeterminate state.
 *
 * @tag elo-checkbox
 *
 * @slot label - Rich label content, instead of the `label` attribute.
 * @slot hint - Rich hint content, instead of the `hint` attribute.
 *
 * @csspart label - The label row, including the box.
 * @csspart control - The native checkbox.
 * @csspart hint - The hint text.
 * @csspart error - The error text.
 *
 * @fires input - When the user toggles the checkbox.
 * @fires change - When the user toggles the checkbox.
 */
export class EloCheckbox extends CheckControl {
  static override styles = [
    hostStyles,
    visuallyHiddenStyles,
    fieldStyles,
    choiceStyles,
    css`
      input {
        width: 1rem;
        height: 1rem;
        background: var(--elo-color-surface);
        border: var(--elo-border-width) solid var(--elo-color-border-control);
        border-radius: var(--elo-radius-sm);
      }

      input:checked,
      input:indeterminate {
        background: var(--elo-color-accent);
        border-color: var(--elo-color-accent);
      }

      input.invalid:not(:checked) {
        border-color: var(--elo-color-danger);
      }

      .mark {
        position: absolute;
        width: 0.75rem;
        height: 0.75rem;
        color: var(--elo-color-accent-fg);
        pointer-events: none;
      }

      @media (forced-colors: active) {
        input {
          border-color: FieldText;
        }

        input:checked,
        input:indeterminate {
          background: Highlight;
        }

        .mark {
          color: HighlightText;
        }
      }
    `,
  ];

  /** Shows a dash for a partially selected group. Cleared when the user toggles it. */
  @property({ type: Boolean, reflect: true }) accessor indeterminate = false;

  #onInput = (event: Event) => {
    this.indeterminate = false;
    this.onNativeInput(event);
  };

  override render(): TemplateResult {
    const error = this.visibleError;
    const mark = this.indeterminate
      ? svg`<path d="M3 6h6"></path>`
      : this.checked
        ? svg`<path d="M2.5 6.5l2.5 2.5 4.5-5.5"></path>`
        : null;

    return html`<div class="field">
      <label part="label" class=${classMap({ choice: true, disabled: this.isDisabled })}>
        <span class="indicator">
          <input
            id="control"
            part="control"
            type="checkbox"
            class=${error ? 'invalid' : ''}
            .checked=${live(this.checked)}
            .indeterminate=${this.indeterminate}
            name=${ifDefined(this.name)}
            .value=${this.value}
            ?required=${this.required}
            ?disabled=${this.isDisabled}
            aria-describedby=${ifDefined(this.describedBy)}
            aria-invalid=${error ? 'true' : 'false'}
            @input=${this.#onInput}
            @change=${this.onNativeChange}
          />
          ${
            mark
              ? html`<svg
                  class="mark"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  ${mark}
                </svg>`
              : null
          }
        </span>
        <span class=${this.hideLabel ? 'visually-hidden' : ''}>${this.renderLabelContent()}</span>
      </label>
      <div class="help">${this.renderHelpText()}</div>
    </div>`;
  }
}

defineElement('elo-checkbox', EloCheckbox);

declare global {
  interface HTMLElementTagNameMap {
    'elo-checkbox': EloCheckbox;
  }
}
