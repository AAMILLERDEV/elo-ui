import { LitElement, css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '@elo-ui/core';

export type SkeletonShape = 'text' | 'rect' | 'circle';

/**
 * A placeholder shape while content loads. Hidden from screen readers; mark the loading region `aria-busy="true"`.
 *
 * @tag elo-skeleton
 *
 * @csspart base - The shape.
 *
 * @cssprop --elo-skeleton-width - Width. Defaults to 100%, or 2.5rem for circles.
 * @cssprop --elo-skeleton-height - Height. Defaults to one line of text, or the width for circles.
 */
export class EloSkeleton extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .base {
      width: var(--elo-skeleton-width, 100%);
      height: var(--elo-skeleton-height, 1em);
      margin-block: 0.25em;
      background: var(--elo-color-surface-active);
      border-radius: var(--elo-radius-sm);
      animation: elo-pulse 1.5s ease-in-out infinite;
    }

    :host([shape='rect']) .base {
      height: var(--elo-skeleton-height, 6rem);
      border-radius: var(--elo-radius-md);
    }

    :host([shape='circle']) .base {
      width: var(--elo-skeleton-width, 2.5rem);
      height: var(--elo-skeleton-height, var(--elo-skeleton-width, 2.5rem));
      margin: 0;
      border-radius: var(--elo-radius-full);
    }

    @keyframes elo-pulse {
      50% {
        opacity: 0.5;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .base {
        animation: none;
      }
    }

    @media (forced-colors: active) {
      .base {
        background: GrayText;
      }
    }
  `;

  /** Placeholder shape. */
  @property({ reflect: true }) accessor shape: SkeletonShape = 'text';

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  override render(): TemplateResult {
    return html`<div part="base" class="base"></div>`;
  }
}

defineElement('elo-skeleton', EloSkeleton);

declare global {
  interface HTMLElementTagNameMap {
    'elo-skeleton': EloSkeleton;
  }
}
