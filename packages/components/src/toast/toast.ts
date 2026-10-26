import { LitElement, css, html, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { announce, defineElement, focusRingStyles, hostStyles } from '@elo-ui/core';
import { icon, type StatusVariant } from '../shared/icons.js';
import { variantStyles } from '../shared/variant.styles.js';
import { EloToastRegion, type ToastPlacement } from '../toast-region/toast-region.js';
import '../button/button.js';

/**
 * A brief notification, usually created with `toast()`. Announced to screen readers when shown.
 *
 * @tag elo-toast
 *
 * @slot - The message.
 * @slot heading - Rich heading content, instead of the `heading` attribute.
 * @slot action - One action, usually a small `<elo-button>`. Keeps the toast open until dismissed.
 *
 * @csspart base - The toast box.
 * @csspart close-button - The dismiss button.
 *
 * @fires elo-close - After the toast is dismissed, just before it's removed.
 */
export class EloToast extends LitElement {
  static override styles = [
    hostStyles,
    focusRingStyles,
    variantStyles,
    css`
      :host {
        display: block;
        animation: elo-toast-in var(--elo-duration-normal) var(--elo-easing);
      }

      .base {
        display: flex;
        gap: var(--elo-space-3);
        padding: var(--elo-space-3) var(--elo-space-3) var(--elo-space-3) var(--elo-space-4);
        color: var(--elo-color-fg);
        font-size: var(--elo-font-size-md);
        line-height: var(--elo-line-height);
        background: var(--elo-color-surface);
        border: var(--elo-border-width) solid var(--elo-color-border);
        border-inline-start: 4px solid var(--_fg);
        border-radius: var(--elo-radius-md);
        box-shadow: var(--elo-shadow-lg);
      }

      .icon {
        margin-block: calc((1lh - 1rem) / 2);
        color: var(--_fg);
      }

      .content {
        flex: 1;
        min-width: 0;
      }

      .heading {
        font-weight: var(--elo-font-weight-semibold);
      }

      .action {
        margin-top: var(--elo-space-2);
      }

      .close {
        display: grid;
        flex-shrink: 0;
        place-items: center;
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        color: var(--elo-color-fg-muted);
        background: none;
        border: 0;
        border-radius: var(--elo-radius-sm);
        cursor: pointer;
      }

      .close:hover {
        color: var(--elo-color-fg);
        background: var(--elo-color-surface-hover);
      }

      [hidden] {
        display: none !important;
      }

      @keyframes elo-toast-in {
        from {
          opacity: 0;
          translate: 0 0.5rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          animation: none;
        }
      }
    `,
  ];

  /** Color, icon, and urgency. `danger` toasts are announced assertively and stay until dismissed. */
  @property({ reflect: true }) accessor variant: StatusVariant = 'neutral';

  /** Bold first line. */
  @property() accessor heading = '';

  /** Milliseconds before dismissing itself; 0 keeps it open. Defaults to 5000, or 0 for danger and toasts with an action. */
  @property({ type: Number }) accessor duration: number | undefined;

  /** Accessible name of the dismiss button. */
  @property({ attribute: 'close-label' }) accessor closeLabel = 'Dismiss';

  @state() private accessor hasAction = false;

  #timer: ReturnType<typeof setTimeout> | undefined;
  #remaining = 0;
  #startedAt = 0;
  #paused = false;

  constructor() {
    super();
    // Pause while the user is reading or interacting (WCAG 2.2.1).
    this.addEventListener('pointerenter', () => this.#pause());
    this.addEventListener('pointerleave', () => this.#resume());
    this.addEventListener('focusin', () => this.#pause());
    this.addEventListener('focusout', (e) => {
      if (!this.contains(e.relatedTarget as Node)) this.#resume();
    });
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.dismiss();
    });
  }

  get #effectiveDuration(): number {
    return this.duration ?? (this.variant === 'danger' || this.hasAction ? 0 : 5000);
  }

  protected override firstUpdated(changed: PropertyValues<this>): void {
    super.firstUpdated(changed);
    this.hasAction = Boolean(this.querySelector('[slot="action"]'));
    const text = [this.heading, this.textContent?.trim()].filter(Boolean).join('. ');
    void announce(text, { politeness: this.variant === 'danger' ? 'assertive' : 'polite' });
    this.#remaining = this.#effectiveDuration;
    this.#start();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.#timer);
  }

  #start(): void {
    if (this.#remaining <= 0 || this.#paused) return;
    this.#startedAt = Date.now();
    this.#timer = setTimeout(() => this.dismiss(), this.#remaining);
  }

  #pause(): void {
    if (this.#paused) return;
    this.#paused = true;
    if (this.#timer !== undefined) {
      clearTimeout(this.#timer);
      this.#timer = undefined;
      this.#remaining -= Date.now() - this.#startedAt;
    }
  }

  #resume(): void {
    this.#paused = false;
    this.#start();
  }

  /** Removes the toast and fires `elo-close`. */
  dismiss(): void {
    clearTimeout(this.#timer);
    if (!this.isConnected) return;
    this.dispatchEvent(new Event('elo-close', { bubbles: true, composed: true }));
    this.remove();
  }

  override render(): TemplateResult {
    return html`<div part="base" class="base">
      ${icon(this.variant)}
      <div class="content">
        <div class="heading" ?hidden=${!this.heading}>
          <slot name="heading">${this.heading}</slot>
        </div>
        <slot></slot>
        <div class="action" ?hidden=${!this.hasAction}><slot name="action"></slot></div>
      </div>
      <button
        part="close-button"
        class="close focus-ring"
        aria-label=${this.closeLabel}
        @click=${() => this.dismiss()}
      >
        ${icon('close')}
      </button>
    </div>`;
  }
}

defineElement('elo-toast', EloToast);

export interface ToastOptions {
  /** The message. */
  message: string;
  /** Bold first line. */
  heading?: string;
  variant?: StatusVariant;
  /** Milliseconds before dismissing; 0 keeps it open. */
  duration?: number;
  /** One action button. Choosing it dismisses the toast. */
  action?: { label: string; onClick: () => void };
  /** Where the shared toast region sits. Applies to the region, so affects all toasts. */
  placement?: ToastPlacement;
}

/** Shows a toast in the page's toast region, creating the region if needed. */
export function toast(options: ToastOptions): EloToast {
  let region = document.querySelector<EloToastRegion>('elo-toast-region');
  if (!region) {
    region = document.createElement('elo-toast-region');
    document.body.append(region);
  }
  if (options.placement) region.placement = options.placement;

  const el = document.createElement('elo-toast');
  el.variant = options.variant ?? 'neutral';
  if (options.heading) el.heading = options.heading;
  if (options.duration !== undefined) el.duration = options.duration;
  el.append(options.message);

  if (options.action) {
    const { label, onClick } = options.action;
    const button = document.createElement('elo-button');
    button.slot = 'action';
    button.size = 'sm';
    button.textContent = label;
    button.addEventListener('click', () => {
      onClick();
      el.dismiss();
    });
    el.append(button);
  }

  region.append(el);
  return el;
}

declare global {
  interface HTMLElementTagNameMap {
    'elo-toast': EloToast;
  }
}
