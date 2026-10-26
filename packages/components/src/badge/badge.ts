import { LitElement, css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement, hostStyles } from '@elo-ui/core';
import type { StatusVariant } from '../shared/icons.js';
import { variantStyles } from '../shared/variant.styles.js';

/**
 * A short status label, such as "Active" or "3 failed".
 *
 * @tag elo-badge
 *
 * @slot - The label.
 *
 * @csspart base - The badge.
 */
export class EloBadge extends LitElement {
  static override styles = [
    hostStyles,
    variantStyles,
    css`
      :host {
        display: inline-flex;
        vertical-align: middle;
      }

      .base {
        display: inline-flex;
        gap: 0.375em;
        align-items: center;
        padding: 0.125rem 0.5rem;
        color: var(--_fg);
        font-size: var(--elo-font-size-sm);
        font-weight: var(--elo-font-weight-medium);
        line-height: 1.25rem;
        white-space: nowrap;
        background: var(--_bg);
        border: var(--elo-border-width) solid var(--_border);
        border-radius: var(--elo-radius-full);
      }

      .dot {
        width: 0.375rem;
        height: 0.375rem;
        background: currentColor;
        border-radius: var(--elo-radius-full);
      }
    `,
  ];

  /** Color. */
  @property({ reflect: true }) accessor variant: StatusVariant = 'neutral';

  /** Shows a colored dot before the label. */
  @property({ type: Boolean }) accessor dot = false;

  override render(): TemplateResult {
    return html`<span part="base" class="base"
      >${this.dot ? html`<span class="dot" aria-hidden="true"></span>` : null}<slot></slot
    ></span>`;
  }
}

defineElement('elo-badge', EloBadge);

declare global {
  interface HTMLElementTagNameMap {
    'elo-badge': EloBadge;
  }
}
