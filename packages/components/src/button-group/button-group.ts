import { LitElement, css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '@elo-ui/core';

/**
 * Joins related buttons into one segmented control, such as view switchers or split actions.
 *
 * @tag elo-button-group
 *
 * @slot - `<elo-button>` or `<elo-icon-button>` elements.
 */
export class EloButtonGroup extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    ::slotted(:not(:first-child)) {
      margin-inline-start: calc(-1 * var(--elo-border-width));
      --elo-button-start-radius: 0;
    }

    ::slotted(:not(:last-child)) {
      --elo-button-end-radius: 0;
    }

    /* Keep the focused button's ring above its neighbors. */
    ::slotted(:focus-within),
    ::slotted(:hover) {
      position: relative;
      z-index: 1;
    }
  `;

  /** Accessible name for the group, such as "View". */
  @property() accessor label = '';

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
  }

  override updated(): void {
    if (this.label) this.setAttribute('aria-label', this.label);
    else this.removeAttribute('aria-label');
  }

  override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

defineElement('elo-button-group', EloButtonGroup);

declare global {
  interface HTMLElementTagNameMap {
    'elo-button-group': EloButtonGroup;
  }
}
