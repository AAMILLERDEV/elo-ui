import { css, html, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { defineElement, hostStyles, visuallyHiddenStyles } from '@elo-ui/core';
import { CheckControl, choiceStyles } from '../shared/check-control.js';
import { fieldStyles } from '../shared/form-control.styles.js';

/**
 * An on/off switch for settings that apply immediately. Announced as a switch.
 *
 * @tag elo-switch
 *
 * @slot label - Rich label content, instead of the `label` attribute.
 * @slot hint - Rich hint content, instead of the `hint` attribute.
 *
 * @csspart label - The label row, including the track.
 * @csspart control - The native checkbox, styled as the track.
 * @csspart hint - The hint text.
 * @csspart error - The error text.
 *
 * @fires input - When the user toggles the switch.
 * @fires change - When the user toggles the switch.
 */
export class EloSwitch extends CheckControl {
  static override styles = [
    hostStyles,
    visuallyHiddenStyles,
    fieldStyles,
    choiceStyles,
    css`
      .indicator {
        margin-block: calc((1lh - 1.25rem) / 2);
      }

      input {
        width: 2.25rem;
        height: 1.25rem;
        background: var(--elo-color-border-control);
        border-radius: var(--elo-radius-full);
        transition: background-color var(--elo-duration-fast) var(--elo-easing);
      }

      input:checked {
        background: var(--elo-color-accent);
      }

      .thumb {
        position: absolute;
        inset-inline-start: 0.125rem;
        width: 1rem;
        height: 1rem;
        background: var(--elo-white);
        border-radius: var(--elo-radius-full);
        box-shadow: var(--elo-shadow-sm);
        pointer-events: none;
        transition: translate var(--elo-duration-fast) var(--elo-easing);
      }

      input:checked + .thumb {
        translate: 1rem 0;
      }

      :host(:dir(rtl)) input:checked + .thumb {
        translate: -1rem 0;
      }

      .help {
        padding-inline-start: calc(2.25rem + var(--elo-space-2));
      }

      @media (prefers-reduced-motion: reduce) {
        input,
        .thumb {
          transition: none;
        }
      }

      @media (forced-colors: active) {
        input {
          border: 1px solid FieldText;
        }

        input:checked {
          background: Highlight;
        }

        .thumb {
          background: FieldText;
        }

        input:checked + .thumb {
          background: HighlightText;
        }
      }
    `,
  ];

  override render(): TemplateResult {
    const error = this.visibleError;
    return html`<div class="field">
      <label part="label" class=${classMap({ choice: true, disabled: this.isDisabled })}>
        <span class="indicator">
          <input
            id="control"
            part="control"
            type="checkbox"
            role="switch"
            aria-checked=${this.checked ? 'true' : 'false'}
            .checked=${live(this.checked)}
            name=${ifDefined(this.name)}
            .value=${this.value}
            ?required=${this.required}
            ?disabled=${this.isDisabled}
            aria-describedby=${ifDefined(this.describedBy)}
            aria-invalid=${error ? 'true' : 'false'}
            @input=${this.onNativeInput}
            @change=${this.onNativeChange}
          />
          <span class="thumb"></span>
        </span>
        <span class=${this.hideLabel ? 'visually-hidden' : ''}>${this.renderLabelContent()}</span>
      </label>
      <div class="help">${this.renderHelpText()}</div>
    </div>`;
  }
}

defineElement('elo-switch', EloSwitch);

declare global {
  interface HTMLElementTagNameMap {
    'elo-switch': EloSwitch;
  }
}
