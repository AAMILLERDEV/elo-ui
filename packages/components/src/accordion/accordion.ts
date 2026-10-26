import { LitElement, css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement, getDeepActiveElement } from '@elo-ui/core';
import { EloAccordionItem } from '../accordion-item/accordion-item.js';

/**
 * A stack of collapsible sections, following the WAI-ARIA accordion pattern.
 *
 * @tag elo-accordion
 *
 * @slot - `<elo-accordion-item>` elements.
 */
export class EloAccordion extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border-top: var(--elo-border-width) solid var(--elo-color-border);
    }
  `;

  /** Allows only one open item at a time. */
  @property({ type: Boolean }) accessor exclusive = false;

  constructor() {
    super();
    this.addEventListener('elo-open', this.#onOpen);
    this.addEventListener('keydown', this.#onKeyDown);
  }

  /** The items, in order. */
  get items(): EloAccordionItem[] {
    return [...this.querySelectorAll<EloAccordionItem>(':scope > elo-accordion-item')];
  }

  #onOpen = (event: Event): void => {
    if (!this.exclusive || !(event.target instanceof EloAccordionItem)) return;
    for (const item of this.items) {
      if (item !== event.target) item.open = false;
    }
  };

  // Optional APG keys: arrows, Home, and End move between headers.
  #onKeyDown = (event: KeyboardEvent): void => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const items = this.items.filter((item) => !item.disabled);
    const current = items.findIndex((item) => item.shadowRoot?.contains(getDeepActiveElement()));
    if (current === -1) return;
    event.preventDefault();
    const last = items.length - 1;
    const next = {
      ArrowDown: current === last ? 0 : current + 1,
      ArrowUp: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key]!;
    items[next]!.focus();
  };

  override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

defineElement('elo-accordion', EloAccordion);

declare global {
  interface HTMLElementTagNameMap {
    'elo-accordion': EloAccordion;
  }
}
