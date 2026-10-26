import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement, focusRingStyles, hostStyles } from '@elo-ui/core';

export interface PaginationChangeDetail {
  page: number;
}

type Slot = number | 'gap';

/** Page numbers to show: first, last, and `siblings` around the current page; gaps never hide one page. */
export function pageSlots(page: number, total: number, siblings = 1): Slot[] {
  if (total <= 2 * siblings + 5) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(Math.min(page - siblings, total - 2 * siblings - 2), 3);
  const end = Math.min(Math.max(page + siblings, 2 * siblings + 3), total - 2);
  return [
    1,
    start > 3 ? 'gap' : 2,
    ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
    end < total - 2 ? 'gap' : total - 1,
    total,
  ];
}

/**
 * Navigation between pages of results. Renders links with `href-template`, or buttons that fire `elo-page-change`.
 *
 * @tag elo-pagination
 *
 * @csspart list - The list of controls.
 *
 * @fires {CustomEvent<PaginationChangeDetail>} elo-page-change - When the user picks a page (button mode).
 */
export class EloPagination extends LitElement {
  static override styles = [
    hostStyles,
    focusRingStyles,
    css`
      :host {
        display: block;
        font-size: var(--elo-font-size-md);
      }

      ul {
        display: flex;
        flex-wrap: wrap;
        gap: var(--elo-space-1);
        align-items: center;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .control {
        display: inline-grid;
        place-items: center;
        min-width: var(--elo-control-height-sm);
        height: var(--elo-control-height-sm);
        padding: 0 var(--elo-space-2);
        color: var(--elo-color-fg);
        font: inherit;
        font-variant-numeric: tabular-nums;
        text-decoration: none;
        background: none;
        border: var(--elo-border-width) solid transparent;
        border-radius: var(--elo-radius-md);
        cursor: pointer;
      }

      .control:hover:not([aria-disabled='true'], [aria-current]) {
        background: var(--elo-color-surface-hover);
      }

      .control[aria-current] {
        color: var(--elo-color-accent-fg);
        font-weight: var(--elo-font-weight-semibold);
        background: var(--elo-color-accent);
      }

      .control[aria-disabled='true'] {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .gap {
        min-width: var(--elo-control-height-sm);
        color: var(--elo-color-fg-muted);
        text-align: center;
      }

      svg {
        width: 1rem;
        height: 1rem;
      }

      :host(:dir(rtl)) svg {
        scale: -1 1;
      }

      @media (forced-colors: active) {
        .control[aria-current] {
          border-color: Highlight;
        }
      }
    `,
  ];

  /** Current page, starting at 1. */
  @property({ type: Number, reflect: true }) accessor page = 1;

  /** Number of pages. */
  @property({ type: Number, attribute: 'total-pages' }) accessor totalPages = 1;

  /** Pages shown on each side of the current one. */
  @property({ type: Number }) accessor siblings = 1;

  /** Renders links instead of buttons, replacing `{page}`, e.g. `/orders?page={page}`. */
  @property({ attribute: 'href-template' }) accessor hrefTemplate: string | undefined;

  /** Accessible name of the navigation landmark. */
  @property() accessor label = 'Pagination';

  /** Accessible names, for translation. `{page}` is replaced by the number. */
  @property({ attribute: false }) accessor labels = {
    previous: 'Previous page',
    next: 'Next page',
    page: 'Page {page}',
  };

  #go(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
    this.dispatchEvent(
      new CustomEvent<PaginationChangeDetail>('elo-page-change', {
        bubbles: true,
        composed: true,
        detail: { page },
      }),
    );
  }

  #control(
    page: number,
    content: TemplateResult | string,
    label: string,
    current = false,
  ): TemplateResult {
    const disabled = page < 1 || page > this.totalPages;
    if (this.hrefTemplate && !disabled && !current) {
      return html`<a
        class="control focus-ring"
        href=${this.hrefTemplate.replace('{page}', String(page))}
        aria-label=${label}
        >${content}</a
      >`;
    }
    return html`<button
      class="control focus-ring"
      aria-label=${label}
      aria-current=${current ? 'page' : nothing}
      aria-disabled=${disabled ? 'true' : nothing}
      @click=${() => this.#go(page)}
    >
      ${content}
    </button>`;
  }

  override render(): TemplateResult {
    const chevron = (d: string) =>
      html`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
        <path d=${d} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>`;
    const pageLabel = (n: number) => this.labels.page.replace('{page}', String(n));
    return html`<nav aria-label=${this.label}>
      <ul part="list">
        <li>${this.#control(this.page - 1, chevron('M10 4l-4 4 4 4'), this.labels.previous)}</li>
        ${pageSlots(this.page, this.totalPages, this.siblings).map((slot) =>
          slot === 'gap'
            ? html`<li class="gap" aria-hidden="true">…</li>`
            : html`<li>
                ${this.#control(slot, String(slot), pageLabel(slot), slot === this.page)}
              </li>`,
        )}
        <li>${this.#control(this.page + 1, chevron('M6 4l4 4-4 4'), this.labels.next)}</li>
      </ul>
    </nav>`;
  }
}

defineElement('elo-pagination', EloPagination);

declare global {
  interface HTMLElementTagNameMap {
    'elo-pagination': EloPagination;
  }
}
