import { LitElement, css, html, type PropertyValues, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { defineElement, focusRingStyles, hostStyles } from '@elo-ui/core';
import type { HeadingLevel } from '../card/card.js';

/**
 * One collapsible section of an `<elo-accordion>`.
 *
 * @tag elo-accordion-item
 *
 * @slot - The section content.
 * @slot heading - Rich heading content, instead of the `heading` attribute.
 *
 * @csspart heading - The heading wrapping the toggle button.
 * @csspart trigger - The toggle button.
 * @csspart panel - The content region.
 *
 * @fires elo-open - After the item expands.
 * @fires elo-close - After the item collapses.
 */
export class EloAccordionItem extends LitElement {
  static override styles = [
    hostStyles,
    focusRingStyles,
    css`
      :host {
        display: block;
        color: var(--elo-color-fg);
        font-size: var(--elo-font-size-md);
        line-height: var(--elo-line-height);
        border-bottom: var(--elo-border-width) solid var(--elo-color-border);
      }

      .heading {
        margin: 0;
        font-size: inherit;
        font-weight: inherit;
      }

      .trigger {
        display: flex;
        gap: var(--elo-space-3);
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: var(--elo-space-3) var(--elo-space-1);
        color: inherit;
        font: inherit;
        font-weight: var(--elo-font-weight-medium);
        text-align: start;
        background: none;
        border: 0;
        cursor: pointer;
      }

      .trigger:hover {
        background: var(--elo-color-surface-hover);
      }

      .trigger:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .chevron {
        flex-shrink: 0;
        width: 1rem;
        height: 1rem;
        color: var(--elo-color-fg-muted);
        transition: rotate var(--elo-duration-fast) var(--elo-easing);
      }

      :host([open]) .chevron {
        rotate: 180deg;
      }

      .panel {
        padding: 0 var(--elo-space-1) var(--elo-space-4);
      }

      .panel[hidden] {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .chevron {
          transition: none;
        }
      }
    `,
  ];

  /** Whether the section is expanded. */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /** The section heading. Use the `heading` slot for rich content. */
  @property() accessor heading = '';

  /** Heading level, to fit the page outline. */
  @property({ type: Number, attribute: 'heading-level' }) accessor headingLevel: HeadingLevel = 3;

  /** Disables the toggle. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  @query('button') private accessor trigger: HTMLButtonElement | null = null;

  /** Moves focus to the toggle button. */
  override focus(options?: FocusOptions): void {
    this.trigger?.focus(options);
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (changed.has('open') && changed.get('open') !== undefined) {
      this.dispatchEvent(
        new Event(this.open ? 'elo-open' : 'elo-close', { bubbles: true, composed: true }),
      );
    }
  }

  #toggle = (): void => {
    this.open = !this.open;
  };

  override render(): TemplateResult {
    return html`<div part="heading" class="heading" role="heading" aria-level=${this.headingLevel}>
        <button
          part="trigger"
          class="trigger focus-ring"
          id="trigger"
          aria-expanded=${String(this.open)}
          aria-controls="panel"
          ?disabled=${this.disabled}
          @click=${this.#toggle}
        >
          <slot name="heading">${this.heading}</slot>
          <svg
            class="chevron"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <div
        part="panel"
        class="panel"
        id="panel"
        role="region"
        aria-labelledby="trigger"
        ?hidden=${!this.open}
      >
        <slot></slot>
      </div>`;
  }
}

defineElement('elo-accordion-item', EloAccordionItem);

declare global {
  interface HTMLElementTagNameMap {
    'elo-accordion-item': EloAccordionItem;
  }
}
