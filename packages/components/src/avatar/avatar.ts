import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement, hostStyles } from '@elo-ui/core';

export type AvatarSize = 'sm' | 'md' | 'lg';

/** Up to two initials from a name: "Ada Lovelace" → "AL". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0]!, words.at(-1)!] : words;
  return letters.map((word) => [...word][0]!.toLocaleUpperCase()).join('');
}

/**
 * A person's picture, falling back to their initials.
 *
 * @tag elo-avatar
 *
 * @csspart base - The circle.
 */
export class EloAvatar extends LitElement {
  static override styles = [
    hostStyles,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
        --_size: 2rem;
      }

      :host([size='sm']) {
        --_size: 1.5rem;
      }

      :host([size='lg']) {
        --_size: 2.75rem;
      }

      .base {
        display: grid;
        place-items: center;
        width: var(--_size);
        height: var(--_size);
        overflow: hidden;
        color: var(--elo-color-accent-text);
        font-size: calc(var(--_size) * 0.4);
        font-weight: var(--elo-font-weight-semibold);
        line-height: 1;
        background: var(--elo-color-info-soft-bg);
        border-radius: var(--elo-radius-full);
        user-select: none;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      @media (forced-colors: active) {
        .base {
          border: 1px solid CanvasText;
        }
      }
    `,
  ];

  /** Picture URL. Falls back to initials if missing or it fails to load. */
  @property() accessor src: string | undefined;

  /** The person's name: the accessible name and the source of the initials. */
  @property() accessor name = '';

  /** Size. */
  @property({ reflect: true }) accessor size: AvatarSize = 'md';

  /** Hides the avatar from screen readers, when the name is already shown beside it. */
  @property({ type: Boolean }) accessor decorative = false;

  @state() private accessor failed = false;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('src')) this.failed = false;
  }

  override render(): TemplateResult {
    const label = this.decorative ? nothing : this.name || nothing;
    if (this.src && !this.failed) {
      return html`<span part="base" class="base" aria-hidden=${this.decorative ? 'true' : nothing}>
        <img
          src=${this.src}
          alt=${this.decorative ? '' : this.name}
          @error=${() => (this.failed = true)}
        />
      </span>`;
    }
    return html`<span
      part="base"
      class="base"
      role=${this.decorative ? nothing : 'img'}
      aria-label=${label}
      aria-hidden=${this.decorative ? 'true' : nothing}
      ><span aria-hidden="true">${initials(this.name)}</span></span
    >`;
  }
}

defineElement('elo-avatar', EloAvatar);

declare global {
  interface HTMLElementTagNameMap {
    'elo-avatar': EloAvatar;
  }
}
