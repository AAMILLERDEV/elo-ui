import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineElement, hostStyles, visuallyHiddenStyles } from '@elo-ui/core';

/**
 * A progress bar with a label. Omit `value` for an indeterminate bar.
 *
 * @tag elo-progress
 *
 * @csspart label - The label row.
 * @csspart track - The bar's track.
 * @csspart indicator - The filled part of the bar.
 */
export class EloProgress extends LitElement {
  static override styles = [
    hostStyles,
    visuallyHiddenStyles,
    css`
      :host {
        display: block;
        color: var(--elo-color-fg);
        font-size: var(--elo-font-size-md);
        line-height: var(--elo-line-height);
      }

      .label {
        display: flex;
        justify-content: space-between;
        gap: var(--elo-space-3);
        margin-bottom: var(--elo-space-1);
        font-weight: var(--elo-font-weight-medium);
      }

      .value {
        color: var(--elo-color-fg-muted);
        font-variant-numeric: tabular-nums;
      }

      .track {
        position: relative;
        height: 0.5rem;
        overflow: hidden;
        background: var(--elo-color-surface-active);
        border-radius: var(--elo-radius-full);
      }

      .indicator {
        height: 100%;
        background: var(--elo-color-accent);
        border-radius: inherit;
        transition: width var(--elo-duration-normal) var(--elo-easing);
      }

      .indeterminate .indicator {
        position: absolute;
        width: 40%;
        animation: elo-indeterminate 1.4s ease-in-out infinite;
      }

      @keyframes elo-indeterminate {
        from {
          left: -40%;
        }
        to {
          left: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .indicator {
          transition: none;
        }

        .indeterminate .indicator {
          left: 30%;
          animation: none;
        }
      }

      @media (forced-colors: active) {
        .track {
          border: 1px solid CanvasText;
        }

        .indicator {
          background: Highlight;
        }
      }
    `,
  ];

  /** Current value, from 0 to `max`. Leave unset while the amount is unknown. */
  @property({ type: Number }) accessor value: number | undefined;

  /** Value at completion. */
  @property({ type: Number }) accessor max = 100;

  /** What is progressing, such as "Uploading report.pdf". */
  @property() accessor label = '';

  /** Hides the label visually; screen readers still announce it. */
  @property({ type: Boolean, attribute: 'hide-label' }) accessor hideLabel = false;

  /** Text announced for the value, such as "3 of 10 files". Defaults to a percentage. */
  @property({ attribute: 'value-text' }) accessor valueText: string | undefined;

  override render(): TemplateResult {
    const determinate = this.value !== undefined;
    const percent = determinate ? Math.min(100, Math.max(0, (this.value! / this.max) * 100)) : 0;
    const text = determinate ? (this.valueText ?? `${Math.round(percent)}%`) : undefined;
    return html`<div part="label" class=${this.hideLabel ? 'label visually-hidden' : 'label'}>
        <span id="label">${this.label}</span>
        ${text ? html`<span class="value" aria-hidden="true">${text}</span>` : nothing}
      </div>
      <div
        part="track"
        class=${determinate ? 'track' : 'track indeterminate'}
        role="progressbar"
        aria-labelledby="label"
        aria-valuemin=${ifDefined(determinate ? 0 : undefined)}
        aria-valuemax=${ifDefined(determinate ? this.max : undefined)}
        aria-valuenow=${ifDefined(determinate ? this.value : undefined)}
        aria-valuetext=${ifDefined(text)}
      >
        <div
          part="indicator"
          class="indicator"
          style=${determinate ? `width: ${percent}%` : ''}
        ></div>
      </div>`;
  }
}

defineElement('elo-progress', EloProgress);

declare global {
  interface HTMLElementTagNameMap {
    'elo-progress': EloProgress;
  }
}
