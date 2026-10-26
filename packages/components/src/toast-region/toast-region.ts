import { LitElement, css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '@elo-ui/core';

export type ToastPlacement =
  'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

/**
 * Stacks `<elo-toast>` notifications in a corner of the screen, above dialogs. `toast()` creates one on demand.
 *
 * @tag elo-toast-region
 *
 * @slot - `<elo-toast>` elements.
 */
export class EloToastRegion extends LitElement {
  static override styles = css`
    :host {
      position: fixed;
      inset: auto;
      display: flex;
      flex-direction: column;
      gap: var(--elo-space-2);
      width: min(24rem, calc(100vw - 2rem));
      margin: 0;
      padding: 0;
      overflow: visible;
      background: none;
      border: 0;
      pointer-events: none;
    }

    :host(:not(:popover-open)) {
      display: none;
    }

    :host([placement^='top']) {
      top: 1rem;
    }

    :host([placement^='bottom']) {
      bottom: 1rem;
      flex-direction: column-reverse;
    }

    :host([placement$='start']) {
      inset-inline-start: 1rem;
    }

    :host([placement$='end']) {
      inset-inline-end: 1rem;
    }

    :host([placement$='center']) {
      left: 50%;
      translate: -50% 0;
    }

    ::slotted(*) {
      pointer-events: auto;
    }
  `;

  /** Corner or edge where toasts appear. */
  @property({ reflect: true }) accessor placement: ToastPlacement = 'bottom-end';

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('popover', 'manual');
    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Notifications');
  }

  // Re-show on each new toast so the region stays above dialogs opened since.
  #onSlotChange = (): void => {
    const hasToasts = this.children.length > 0;
    if (this.matches(':popover-open')) this.hidePopover();
    if (hasToasts && this.isConnected) this.showPopover();
  };

  override render(): TemplateResult {
    return html`<slot @slotchange=${this.#onSlotChange}></slot>`;
  }
}

defineElement('elo-toast-region', EloToastRegion);

declare global {
  interface HTMLElementTagNameMap {
    'elo-toast-region': EloToastRegion;
  }
}
