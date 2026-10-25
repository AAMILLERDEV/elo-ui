import { LitElement, css, html, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement, hostStyles } from '@elo-ui/core';

/**
 * An action in an `<elo-dropdown>` menu.
 *
 * @tag elo-menu-item
 *
 * @slot - The item's label.
 * @slot start - Content before the label, such as an icon.
 * @slot end - Content after the label, such as a keyboard shortcut.
 *
 * @csspart label - The label.
 */
export class EloMenuItem extends LitElement {
  static override styles = [
    hostStyles,
    css`
      :host {
        display: flex;
        gap: var(--elo-space-2);
        align-items: center;
        min-height: var(--elo-control-height-sm);
        padding: 0 var(--elo-space-3);
        color: var(--elo-color-fg);
        border-radius: var(--elo-radius-sm);
        cursor: pointer;
        outline: none;
        user-select: none;
      }

      :host(:hover),
      :host(:focus-visible),
      :host(:focus) {
        background: var(--elo-color-surface-hover);
      }

      :host(:focus-visible) {
        outline: var(--elo-focus-ring-width) solid var(--elo-color-focus-ring);
        outline-offset: -2px;
      }

      :host([variant='danger']) {
        color: var(--elo-color-danger-text);
      }

      :host([disabled]) {
        cursor: not-allowed;
        opacity: 0.5;
      }

      :host([disabled]:hover) {
        background: none;
      }

      .label {
        flex: 1;
        white-space: nowrap;
      }

      ::slotted([slot='end']) {
        color: var(--elo-color-fg-muted);
        font-size: var(--elo-font-size-sm);
      }

      ::slotted(svg) {
        width: 1em;
        height: 1em;
      }

      @media (forced-colors: active) {
        :host(:focus) {
          outline: 2px solid Highlight;
        }
      }
    `,
  ];

  /** Sent in the dropdown's `elo-select` event. Defaults to the item's text. */
  @property() accessor value: string | undefined;

  /** Use `danger` for destructive actions. */
  @property({ reflect: true }) accessor variant: 'default' | 'danger' = 'default';

  /** Disables the item. It stays visible but can't be focused or chosen. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'menuitem');
    if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this.setAttribute('aria-disabled', String(this.disabled));
  }

  override render(): TemplateResult {
    return html`<slot name="start"></slot><span part="label" class="label"><slot></slot></span
      ><slot name="end"></slot>`;
  }
}

defineElement('elo-menu-item', EloMenuItem);

declare global {
  interface HTMLElementTagNameMap {
    'elo-menu-item': EloMenuItem;
  }
}
