import { LitElement, css, html, type PropertyValues, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { defineElement, hostStyles } from '@elo-ui/core';
import { anchorTo, floatingStyles, type Placement } from '../shared/floating.js';
import { firstAssigned, setTriggerState } from '../shared/trigger.js';

/**
 * A short text hint shown on hover and keyboard focus. Its text is also announced as the trigger's description.
 *
 * @tag elo-tooltip
 *
 * @slot - The element the tooltip describes. Must be focusable.
 *
 * @csspart tooltip - The floating tooltip.
 */
export class EloTooltip extends LitElement {
  static override styles = [
    hostStyles,
    floatingStyles,
    css`
      :host {
        display: inline-block;
      }

      .tooltip {
        max-width: 18rem;
        padding: var(--elo-space-1) var(--elo-space-2);
        font-size: var(--elo-font-size-sm);
        color: var(--elo-color-inverse-fg);
        background: var(--elo-color-inverse-bg);
        border-radius: var(--elo-radius-sm);
      }

      @media (forced-colors: active) {
        .tooltip {
          border: 1px solid CanvasText;
        }
      }
    `,
  ];

  /** The tooltip text. */
  @property() accessor content = '';

  /** Preferred side; flips to stay in view. */
  @property() accessor placement: Placement = 'top';

  /** Milliseconds to wait on hover before showing. Keyboard focus shows immediately. */
  @property({ type: Number, attribute: 'show-delay' }) accessor showDelay = 300;

  /** Also announce the text as the trigger's description. Turn off when it repeats the trigger's name. */
  @property({ type: Boolean }) accessor describe = true;

  /** Whether the tooltip is showing. */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  @query('[popover]') private accessor tooltip: HTMLElement | null = null;

  #showTimer: ReturnType<typeof setTimeout> | undefined;
  #hideTimer: ReturnType<typeof setTimeout> | undefined;
  #cleanup: (() => void) | undefined;

  constructor() {
    super();
    this.addEventListener('pointerenter', () => this.#scheduleShow(this.showDelay));
    this.addEventListener('pointerleave', this.#scheduleHide);
    this.addEventListener('focusin', () => this.#scheduleShow(0));
    this.addEventListener('focusout', this.#scheduleHide);
    this.addEventListener('pointerdown', () => this.#setOpen(false));
  }

  get #trigger(): HTMLElement | undefined {
    return firstAssigned(this.renderRoot.querySelector('slot'));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#setOpen(false);
    document.removeEventListener('keydown', this.#onDocumentKeyDown);
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (changed.has('content') || changed.has('describe')) this.#describeTrigger();
    if (changed.has('open')) this.#sync();
  }

  #describeTrigger = (): void => {
    const trigger = this.#trigger;
    const description = this.describe ? this.content || undefined : undefined;
    if (trigger) setTriggerState(trigger, { description });
  };

  #scheduleShow(delay: number): void {
    clearTimeout(this.#hideTimer);
    clearTimeout(this.#showTimer);
    this.#showTimer = setTimeout(() => this.#setOpen(true), delay);
  }

  // A short grace period lets the pointer move onto the tooltip (WCAG 1.4.13, hoverable).
  #scheduleHide = (): void => {
    clearTimeout(this.#showTimer);
    clearTimeout(this.#hideTimer);
    this.#hideTimer = setTimeout(() => this.#setOpen(false), 100);
  };

  #setOpen(open: boolean): void {
    clearTimeout(this.#showTimer);
    clearTimeout(this.#hideTimer);
    this.open = open && Boolean(this.content);
  }

  #sync(): void {
    const tooltip = this.tooltip;
    const trigger = this.#trigger;
    if (!tooltip) return;
    if (this.open && !tooltip.matches(':popover-open')) {
      tooltip.showPopover();
      if (trigger) this.#cleanup = anchorTo(trigger, tooltip, this.placement, 6);
      document.addEventListener('keydown', this.#onDocumentKeyDown);
    } else if (!this.open && tooltip.matches(':popover-open')) {
      tooltip.hidePopover();
      this.#cleanup?.();
      this.#cleanup = undefined;
      document.removeEventListener('keydown', this.#onDocumentKeyDown);
    }
  }

  // Esc dismisses without moving focus (WCAG 1.4.13, dismissible).
  #onDocumentKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.#setOpen(false);
  };

  override render(): TemplateResult {
    return html`<slot @slotchange=${this.#describeTrigger}></slot>
      <div
        popover="manual"
        part="tooltip"
        class="tooltip"
        role="tooltip"
        aria-hidden="true"
        @pointerenter=${() => clearTimeout(this.#hideTimer)}
        @pointerleave=${this.#scheduleHide}
      >
        ${this.content}
      </div>`;
  }
}

defineElement('elo-tooltip', EloTooltip);

declare global {
  interface HTMLElementTagNameMap {
    'elo-tooltip': EloTooltip;
  }
}
