import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement, hostStyles } from '@elo-ui/core';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * A container that groups related content, such as a metric, a chart, or a settings section.
 *
 * @tag elo-card
 *
 * @slot - The card body.
 * @slot heading - Rich heading content, instead of the `heading` attribute.
 * @slot actions - Controls in the header, such as a menu button.
 * @slot footer - Content below the body, such as links or buttons.
 *
 * @csspart base - The card box.
 * @csspart header - The header row.
 * @csspart heading - The heading.
 * @csspart body - The body.
 * @csspart footer - The footer.
 */
export class EloCard extends LitElement {
  static override styles = [
    hostStyles,
    css`
      :host {
        display: block;
        color: var(--elo-color-fg);
        font-size: var(--elo-font-size-md);
        line-height: var(--elo-line-height);
      }

      .base {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--elo-color-surface);
        border: var(--elo-border-width) solid var(--elo-color-border);
        border-radius: var(--elo-radius-lg);
        box-shadow: var(--elo-shadow-sm);
      }

      header {
        display: flex;
        gap: var(--elo-space-3);
        align-items: center;
        justify-content: space-between;
        padding: var(--elo-space-4) var(--elo-space-5) 0;
      }

      .heading {
        margin: 0;
        font-size: var(--elo-font-size-lg);
        font-weight: var(--elo-font-weight-semibold);
        line-height: 1.4;
      }

      .body {
        flex: 1;
        padding: var(--elo-space-4) var(--elo-space-5);
      }

      footer {
        padding: var(--elo-space-3) var(--elo-space-5);
        border-top: var(--elo-border-width) solid var(--elo-color-border);
      }

      [hidden] {
        display: none !important;
      }

      @media (forced-colors: active) {
        .base {
          border-color: CanvasText;
        }
      }
    `,
  ];

  /** Title shown in the header. Use the `heading` slot for rich content. */
  @property() accessor heading = '';

  /** Heading level for the title, to fit the page outline. */
  @property({ type: Number, attribute: 'heading-level' }) accessor headingLevel: HeadingLevel = 3;

  @state() private accessor hasHeading = false;
  @state() private accessor hasActions = false;
  @state() private accessor hasFooter = false;

  #updateSlots = (): void => {
    const has = (name: string) =>
      Boolean(
        this.renderRoot.querySelector<HTMLSlotElement>(`slot[name="${name}"]`)?.assignedNodes()
          .length,
      );
    this.hasHeading = Boolean(this.heading) || has('heading');
    this.hasActions = has('actions');
    this.hasFooter = has('footer');
  };

  protected override updated(): void {
    this.#updateSlots();
  }

  override render(): TemplateResult {
    return html`<div part="base" class="base">
      <header part="header" ?hidden=${!this.hasHeading && !this.hasActions}>
        <div
          part="heading"
          class="heading"
          role=${this.hasHeading ? 'heading' : 'none'}
          aria-level=${this.hasHeading ? this.headingLevel : nothing}
        >
          <slot name="heading" @slotchange=${this.#updateSlots}>${this.heading}</slot>
        </div>
        <slot name="actions" @slotchange=${this.#updateSlots}></slot>
      </header>
      <div part="body" class="body"><slot></slot></div>
      <footer part="footer" ?hidden=${!this.hasFooter}>
        <slot name="footer" @slotchange=${this.#updateSlots}></slot>
      </footer>
    </div>`;
  }
}

defineElement('elo-card', EloCard);

declare global {
  interface HTMLElementTagNameMap {
    'elo-card': EloCard;
  }
}
