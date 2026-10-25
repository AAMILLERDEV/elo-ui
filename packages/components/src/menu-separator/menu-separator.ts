import { LitElement, css } from 'lit';
import { defineElement } from '@elo-ui/core';

/**
 * A divider between groups of items in an `<elo-dropdown>` menu.
 *
 * @tag elo-menu-separator
 */
export class EloMenuSeparator extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: var(--elo-border-width);
      margin: var(--elo-space-1) calc(-1 * var(--elo-space-1));
      background: var(--elo-color-border);
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'separator');
  }
}

defineElement('elo-menu-separator', EloMenuSeparator);

declare global {
  interface HTMLElementTagNameMap {
    'elo-menu-separator': EloMenuSeparator;
  }
}
