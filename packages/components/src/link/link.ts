import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineElement, focusRingStyles, hostStyles, visuallyHiddenStyles } from '@elo-ui/core';

/**
 * A styled text link. `external` opens a new tab and says so to screen reader users.
 *
 * @tag elo-link
 *
 * @slot - The link text.
 *
 * @csspart base - The native `<a>`.
 */
export class EloLink extends LitElement {
  static override styles = [
    hostStyles,
    focusRingStyles,
    visuallyHiddenStyles,
    css`
      :host {
        display: inline;
      }

      a {
        color: var(--elo-color-accent-text);
        text-decoration: underline;
        text-underline-offset: 0.2em;
        border-radius: var(--elo-radius-sm);
      }

      a:hover {
        text-decoration-thickness: 2px;
      }

      :host([variant='subtle']) a {
        color: inherit;
        text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
      }

      svg {
        width: 0.8em;
        height: 0.8em;
        margin-inline-start: 0.2em;
        vertical-align: -0.05em;
      }
    `,
  ];

  /** Link URL. */
  @property() accessor href = '';

  /** `subtle` inherits the text color. Keep the underline so links stay recognizable. */
  @property({ reflect: true }) accessor variant: 'default' | 'subtle' = 'default';

  /** Opens in a new tab with `rel="noopener noreferrer"` and announces it. */
  @property({ type: Boolean }) accessor external = false;

  /** Announced after external links. Translate it for other languages. */
  @property({ attribute: 'external-label' }) accessor externalLabel = '(opens in a new tab)';

  /** Downloads the URL instead of navigating. */
  @property() accessor download: string | undefined;

  override render(): TemplateResult {
    return html`<a
      part="base"
      class="focus-ring"
      href=${this.href}
      target=${this.external ? '_blank' : nothing}
      rel=${this.external ? 'noopener noreferrer' : nothing}
      download=${ifDefined(this.download)}
      ><slot></slot>${
        this.external
          ? html`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
                <path
                  d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                /></svg
              ><span class="visually-hidden"> ${this.externalLabel}</span>`
          : nothing
      }</a
    >`;
  }
}

defineElement('elo-link', EloLink);

declare global {
  interface HTMLElementTagNameMap {
    'elo-link': EloLink;
  }
}
