import { LitElement, css, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '@elo-ui/core';

/**
 * A line separating content. Vertical dividers stretch to their container's height.
 *
 * @tag elo-divider
 */
export class EloDivider extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: var(--elo-border-width);
      margin-block: var(--elo-space-4);
      background: var(--elo-color-border);
    }

    :host([orientation='vertical']) {
      display: inline-block;
      align-self: stretch;
      width: var(--elo-border-width);
      height: auto;
      min-height: 1em;
      margin: 0 var(--elo-space-2);
    }

    @media (forced-colors: active) {
      :host {
        background: CanvasText;
      }
    }
  `;

  /** Direction of the line. */
  @property({ reflect: true }) accessor orientation: 'horizontal' | 'vertical' = 'horizontal';

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'separator');
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this.setAttribute('aria-orientation', this.orientation);
  }
}

defineElement('elo-divider', EloDivider);

declare global {
  interface HTMLElementTagNameMap {
    'elo-divider': EloDivider;
  }
}
