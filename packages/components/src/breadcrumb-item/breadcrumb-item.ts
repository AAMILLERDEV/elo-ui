import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement, focusRingStyles, hostStyles } from '@elo-ui/core';

/**
 * One level in an `<elo-breadcrumb>` trail.
 *
 * @tag elo-breadcrumb-item
 *
 * @slot - The item's label.
 *
 * @csspart link - The link, or the current page's text.
 * @csspart separator - The separator before the item.
 */
export class EloBreadcrumbItem extends LitElement {
  static override styles = [
    hostStyles,
    focusRingStyles,
    css`
      :host {
        display: inline-flex;
        gap: var(--elo-space-2);
        align-items: center;
        color: var(--elo-color-fg-muted);
        font-size: var(--elo-font-size-md);
      }

      .separator {
        width: 0.875rem;
        height: 0.875rem;
      }

      :host([data-first]) .separator {
        display: none;
      }

      a {
        color: inherit;
        text-decoration: none;
        border-radius: var(--elo-radius-sm);
      }

      a:hover {
        color: var(--elo-color-fg);
        text-decoration: underline;
      }

      [aria-current] {
        color: var(--elo-color-fg);
        font-weight: var(--elo-font-weight-medium);
      }
    `,
  ];

  /** Link to this level. Omitted on the current page. */
  @property() accessor href: string | undefined;

  /** Whether this is the current page. Set on the last item by `<elo-breadcrumb>`. */
  @property({ type: Boolean, reflect: true }) accessor current = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  override render(): TemplateResult {
    const separator = html`<svg
      part="separator"
      class="separator"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M6 4l4 4-4 4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;
    return html`${separator}${
      this.current || !this.href
        ? html`<span part="link" aria-current=${this.current ? 'page' : nothing}
            ><slot></slot
          ></span>`
        : html`<a part="link" class="focus-ring" href=${this.href}><slot></slot></a>`
    }`;
  }
}

defineElement('elo-breadcrumb-item', EloBreadcrumbItem);

declare global {
  interface HTMLElementTagNameMap {
    'elo-breadcrumb-item': EloBreadcrumbItem;
  }
}
