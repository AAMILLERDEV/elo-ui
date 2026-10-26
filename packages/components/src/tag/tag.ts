import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement, focusRingStyles, hostStyles } from '@elo-ui/core';
import { icon, type StatusVariant } from '../shared/icons.js';
import { variantStyles } from '../shared/variant.styles.js';

/**
 * A label for a category, filter, or selected value, optionally removable.
 *
 * @tag elo-tag
 *
 * @slot - The tag text.
 *
 * @csspart base - The tag.
 * @csspart remove-button - The remove button.
 *
 * @fires elo-remove - When the user activates the remove button. Remove the tag in response.
 */
export class EloTag extends LitElement {
  static override styles = [
    hostStyles,
    focusRingStyles,
    variantStyles,
    css`
      :host {
        display: inline-flex;
        vertical-align: middle;
      }

      .base {
        display: inline-flex;
        gap: var(--elo-space-1);
        align-items: center;
        min-height: 1.5rem;
        padding: 0 var(--elo-space-2);
        color: var(--_fg);
        font-size: var(--elo-font-size-sm);
        font-weight: var(--elo-font-weight-medium);
        white-space: nowrap;
        background: var(--_bg);
        border: var(--elo-border-width) solid var(--_border);
        border-radius: var(--elo-radius-sm);
      }

      .remove {
        display: grid;
        place-items: center;
        width: 1.125rem;
        height: 1.125rem;
        margin-inline-end: calc(-1 * var(--elo-space-1));
        padding: 0;
        color: inherit;
        background: none;
        border: 0;
        border-radius: var(--elo-radius-sm);
        cursor: pointer;
      }

      .remove:hover {
        background: color-mix(in srgb, currentColor 15%, transparent);
      }

      .remove .icon {
        width: 0.75rem;
        height: 0.75rem;
      }
    `,
  ];

  /** Color. */
  @property({ reflect: true }) accessor variant: StatusVariant = 'neutral';

  /** Shows a remove button that fires `elo-remove`. */
  @property({ type: Boolean }) accessor removable = false;

  /** Accessible name of the remove button. `{label}` is replaced by the tag text. */
  @property({ attribute: 'remove-label' }) accessor removeLabel = 'Remove {label}';

  #remove = (): void => {
    this.dispatchEvent(new Event('elo-remove', { bubbles: true, composed: true }));
  };

  override render(): TemplateResult {
    const text = this.textContent?.trim() ?? '';
    return html`<span part="base" class="base">
      <slot @slotchange=${() => this.requestUpdate()}></slot>
      ${
        this.removable
          ? html`<button
              part="remove-button"
              class="remove focus-ring"
              aria-label=${this.removeLabel.replace('{label}', text)}
              @click=${this.#remove}
            >
              ${icon('close')}
            </button>`
          : nothing
      }
    </span>`;
  }
}

defineElement('elo-tag', EloTag);

declare global {
  interface HTMLElementTagNameMap {
    'elo-tag': EloTag;
  }
}
