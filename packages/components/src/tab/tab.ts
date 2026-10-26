import { LitElement, css, html, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement, hostStyles } from '@elo-ui/core';

/**
 * A tab in an `<elo-tabs>` tab list.
 *
 * @tag elo-tab
 *
 * @slot - The tab's label.
 */
export class EloTab extends LitElement {
  static override styles = [
    hostStyles,
    css`
      :host {
        position: relative;
        display: inline-flex;
        gap: var(--elo-space-2);
        align-items: center;
        min-height: var(--elo-control-height-md);
        padding: 0 var(--elo-space-3);
        color: var(--elo-color-fg-muted);
        font-size: var(--elo-font-size-md);
        font-weight: var(--elo-font-weight-medium);
        white-space: nowrap;
        border-radius: var(--elo-radius-sm);
        cursor: pointer;
        outline: none;
        user-select: none;
      }

      :host(:hover) {
        color: var(--elo-color-fg);
      }

      :host([selected]) {
        color: var(--elo-color-fg);
      }

      :host([selected])::after {
        position: absolute;
        inset: auto 0 -1px;
        height: 2px;
        content: '';
        background: var(--elo-color-accent);
      }

      :host([data-vertical][selected])::after {
        inset: 0 auto 0 -1px;
        width: 2px;
        height: auto;
      }

      :host(:focus-visible) {
        outline: var(--elo-focus-ring-width) solid var(--elo-color-focus-ring);
        outline-offset: -2px;
      }

      :host([disabled]) {
        cursor: not-allowed;
        opacity: 0.5;
      }

      @media (forced-colors: active) {
        :host([selected])::after {
          background: Highlight;
        }
      }
    `,
  ];

  /** Name of the `<elo-tab-panel>` this tab shows. */
  @property({ reflect: true }) accessor panel = '';

  /** Whether this tab is selected. Set by `<elo-tabs>`. */
  @property({ type: Boolean, reflect: true }) accessor selected = false;

  /** Disables the tab. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'tab');
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this.setAttribute('aria-selected', String(this.selected));
    this.setAttribute('aria-disabled', String(this.disabled));
  }

  override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

defineElement('elo-tab', EloTab);

declare global {
  interface HTMLElementTagNameMap {
    'elo-tab': EloTab;
  }
}
