import { LitElement, css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement, hostStyles } from '@elo-ui/core';

/**
 * An indeterminate loading indicator. Sizes with `font-size`.
 *
 * @tag elo-spinner
 *
 * @csspart base - The spinning ring.
 */
export class EloSpinner extends LitElement {
  static override styles = [
    hostStyles,
    css`
      :host {
        display: inline-block;
        width: 1em;
        height: 1em;
        color: var(--elo-color-accent);
        vertical-align: middle;
      }

      .base {
        width: 100%;
        height: 100%;
        border: 0.125em solid color-mix(in srgb, currentColor 20%, transparent);
        border-top-color: currentColor;
        border-radius: var(--elo-radius-full);
        animation: elo-spin 700ms linear infinite;
      }

      @keyframes elo-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .base {
          animation-duration: 2s;
        }
      }

      @media (forced-colors: active) {
        .base {
          border-color: GrayText;
          border-top-color: CanvasText;
        }
      }
    `,
  ];

  /** Accessible name, announced as a busy progress indicator. */
  @property() accessor label = 'Loading';

  override render(): TemplateResult {
    return html`<div part="base" class="base" role="progressbar" aria-label=${this.label}></div>`;
  }
}

defineElement('elo-spinner', EloSpinner);

declare global {
  interface HTMLElementTagNameMap {
    'elo-spinner': EloSpinner;
  }
}
