import { LitElement, css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement, hostStyles } from '@elo-ui/core';

/**
 * The content shown for one tab in an `<elo-tabs>`.
 *
 * @tag elo-tab-panel
 *
 * @slot - The panel content.
 */
export class EloTabPanel extends LitElement {
  static override styles = [
    hostStyles,
    css`
      :host {
        display: block;
        padding-block: var(--elo-space-4);
        outline: none;
      }

      :host(:focus-visible) {
        outline: var(--elo-focus-ring-width) solid var(--elo-color-focus-ring);
        outline-offset: var(--elo-focus-ring-offset);
      }

      :host([hidden]) {
        display: none;
      }
    `,
  ];

  /** Matches the `panel` attribute of the tab that shows it. */
  @property({ reflect: true }) accessor name = '';

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'tabpanel');
  }

  override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

defineElement('elo-tab-panel', EloTabPanel);

declare global {
  interface HTMLElementTagNameMap {
    'elo-tab-panel': EloTabPanel;
  }
}
