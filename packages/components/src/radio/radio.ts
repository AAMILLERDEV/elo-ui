import { LitElement, css, html, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement, hostStyles } from '@elo-ui/core';

/**
 * One option in an `<elo-radio-group>`.
 *
 * @tag elo-radio
 *
 * @slot - The option's label.
 *
 * @csspart control - The circle.
 * @csspart label - The label.
 */
export class EloRadio extends LitElement {
  static override styles = [
    hostStyles,
    css`
      :host {
        display: inline-flex;
        gap: var(--elo-space-2);
        align-items: flex-start;
        color: var(--elo-color-fg);
        cursor: pointer;
        outline: none;
      }

      :host([disabled]),
      :host([data-group-disabled]) {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .circle {
        display: inline-grid;
        flex-shrink: 0;
        place-items: center;
        width: 1rem;
        height: 1rem;
        margin-block: calc((1lh - 1rem) / 2);
        background: var(--elo-color-surface);
        border: var(--elo-border-width) solid var(--elo-color-border-control);
        border-radius: var(--elo-radius-full);
      }

      :host([checked]) .circle {
        background: var(--elo-color-accent);
        border-color: var(--elo-color-accent);
      }

      :host([checked]) .circle::after {
        width: 0.375rem;
        height: 0.375rem;
        content: '';
        background: var(--elo-color-accent-fg);
        border-radius: var(--elo-radius-full);
      }

      :host(:focus-visible) .circle {
        outline: var(--elo-focus-ring-width) solid var(--elo-color-focus-ring);
        outline-offset: var(--elo-focus-ring-offset);
      }

      @media (forced-colors: active) {
        .circle {
          border-color: FieldText;
        }

        :host([checked]) .circle {
          background: Highlight;
        }

        :host([checked]) .circle::after {
          background: HighlightText;
        }
      }
    `,
  ];

  /** Value the group takes when this option is selected. */
  @property() accessor value = '';

  /** Disables this option. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Whether this option is selected. Set by the group. */
  @property({ type: Boolean, reflect: true }) accessor checked = false;

  // Host attributes rather than ElementInternals ARIA, which axe and test tools don't read yet.
  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'radio');
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this.setAttribute('aria-checked', String(this.checked));
    this.setAttribute(
      'aria-disabled',
      String(this.disabled || this.hasAttribute('data-group-disabled')),
    );
  }

  override render(): TemplateResult {
    return html`<span part="control" class="circle"></span><span part="label"><slot></slot></span>`;
  }
}

defineElement('elo-radio', EloRadio);

declare global {
  interface HTMLElementTagNameMap {
    'elo-radio': EloRadio;
  }
}
