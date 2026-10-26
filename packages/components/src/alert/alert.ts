import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement, focusRingStyles, hostStyles } from '@elo-ui/core';
import { icon, type StatusVariant } from '../shared/icons.js';
import { variantStyles } from '../shared/variant.styles.js';

/**
 * A message about the page or a task, such as a warning before an irreversible action.
 *
 * @tag elo-alert
 *
 * @slot - The message.
 * @slot heading - Rich heading content, instead of the `heading` attribute.
 * @slot icon - Replaces the variant's icon.
 * @slot actions - Buttons or links below the message.
 *
 * @csspart base - The alert box.
 * @csspart heading - The heading.
 * @csspart close-button - The close button.
 *
 * @fires elo-close - When the user closes the alert. Cancel it to keep the alert visible.
 */
export class EloAlert extends LitElement {
  static override styles = [
    hostStyles,
    focusRingStyles,
    variantStyles,
    css`
      :host {
        display: block;
      }

      .base {
        display: flex;
        gap: var(--elo-space-3);
        padding: var(--elo-space-3) var(--elo-space-4);
        color: var(--_fg);
        font-size: var(--elo-font-size-md);
        line-height: var(--elo-line-height);
        background: var(--_bg);
        border: var(--elo-border-width) solid var(--_border);
        border-radius: var(--elo-radius-md);
      }

      .icon-slot {
        display: flex;
        padding-block: calc((1lh - 1rem) / 2);
      }

      .content {
        flex: 1;
        min-width: 0;
      }

      .heading {
        font-weight: var(--elo-font-weight-semibold);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--elo-space-2);
        margin-top: var(--elo-space-2);
      }

      .close {
        display: grid;
        flex-shrink: 0;
        place-items: center;
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        color: inherit;
        background: none;
        border: 0;
        border-radius: var(--elo-radius-sm);
        cursor: pointer;
      }

      .close:hover {
        background: color-mix(in srgb, currentColor 12%, transparent);
      }

      [hidden] {
        display: none !important;
      }
    `,
  ];

  /** Color and icon. */
  @property({ reflect: true }) accessor variant: StatusVariant = 'info';

  /** Bold first line. Use the `heading` slot for rich content. */
  @property() accessor heading = '';

  /** Announce to screen readers when inserted. Use for alerts added after the page loads. */
  @property({ type: Boolean }) accessor announce = false;

  /** Shows a close button. */
  @property({ type: Boolean }) accessor closable = false;

  /** Accessible name of the close button. */
  @property({ attribute: 'close-label' }) accessor closeLabel = 'Dismiss';

  @state() private accessor hasActions = false;

  #close(): void {
    if (
      this.dispatchEvent(
        new Event('elo-close', { bubbles: true, composed: true, cancelable: true }),
      )
    ) {
      this.hidden = true;
    }
  }

  override render(): TemplateResult {
    const urgent = this.variant === 'danger' || this.variant === 'warning';
    const role = this.announce ? (urgent ? 'alert' : 'status') : nothing;
    return html`<div part="base" class="base" role=${role}>
      <span class="icon-slot"><slot name="icon">${icon(this.variant)}</slot></span>
      <div class="content">
        <div part="heading" class="heading"><slot name="heading">${this.heading}</slot></div>
        <slot></slot>
        <div class="actions" ?hidden=${!this.hasActions}>
          <slot
            name="actions"
            @slotchange=${(e: Event) =>
              (this.hasActions = (e.target as HTMLSlotElement).assignedNodes().length > 0)}
          ></slot>
        </div>
      </div>
      ${
        this.closable
          ? html`<button
              part="close-button"
              class="close focus-ring"
              aria-label=${this.closeLabel}
              @click=${this.#close}
            >
              ${icon('close')}
            </button>`
          : nothing
      }
    </div>`;
  }
}

defineElement('elo-alert', EloAlert);

declare global {
  interface HTMLElementTagNameMap {
    'elo-alert': EloAlert;
  }
}
