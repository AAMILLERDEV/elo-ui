import { LitElement, css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '@elo-ui/core';
import { EloBreadcrumbItem } from '../breadcrumb-item/breadcrumb-item.js';

/**
 * A trail of links to the current page's ancestors. The last item is marked as the current page.
 *
 * @tag elo-breadcrumb
 *
 * @slot - `<elo-breadcrumb-item>` elements.
 *
 * @csspart list - The list of items.
 */
export class EloBreadcrumb extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--elo-space-2);
      align-items: center;
      margin: 0;
      padding: 0;
    }
  `;

  /** Accessible name of the navigation landmark. */
  @property() accessor label = 'Breadcrumb';

  #sync = (): void => {
    const items = [...this.querySelectorAll<EloBreadcrumbItem>(':scope > elo-breadcrumb-item')];
    items.forEach((item, i) => {
      item.current = i === items.length - 1;
      item.toggleAttribute('data-first', i === 0);
    });
  };

  override render(): TemplateResult {
    return html`<nav aria-label=${this.label}>
      <div part="list" class="list" role="list"><slot @slotchange=${this.#sync}></slot></div>
    </nav>`;
  }
}

defineElement('elo-breadcrumb', EloBreadcrumb);

declare global {
  interface HTMLElementTagNameMap {
    'elo-breadcrumb': EloBreadcrumb;
  }
}
