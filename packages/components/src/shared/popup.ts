import { LitElement, html, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { composedContains, getDeepActiveElement } from '@elo-ui/core';
import { anchorTo, type Placement } from './floating.js';
import { firstAssigned, setTriggerState } from './trigger.js';

/** Base for a panel anchored to a slotted trigger: popover and dropdown. */
export abstract class Popup extends LitElement {
  /** Whether the panel is open. */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /** Preferred side and alignment; flips to stay in view. */
  @property() accessor placement: Placement = 'bottom-start';

  #cleanup: (() => void) | undefined;
  #wasOpenOnPointerDown: boolean | undefined;
  #shown = false;
  #focusWasInside = false;

  constructor() {
    super();
    this.addEventListener('focusout', this.onFocusOut);
  }

  /** The slotted trigger element. */
  get trigger(): HTMLElement | undefined {
    return firstAssigned(this.renderRoot.querySelector<HTMLSlotElement>('slot[name="trigger"]'));
  }

  protected get panel(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>('[popover]');
  }

  /** The value for the trigger's `aria-haspopup`. */
  protected abstract get popupType(): 'menu' | 'dialog';

  /** Moves focus into the panel after it opens. */
  protected abstract focusPanel(): void;

  show(): void {
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }

  toggle(): void {
    this.open = !this.open;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#cleanup?.();
    this.#cleanup = undefined;
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (changed.has('open')) this.#sync();
  }

  #sync(): void {
    const panel = this.panel;
    const trigger = this.trigger;
    if (!panel) return;
    if (trigger) setTriggerState(trigger, { expanded: this.open, haspopup: this.popupType });

    if (this.open && !this.#shown) {
      this.#shown = true;
      if (!panel.matches(':popover-open')) panel.showPopover();
      if (trigger) this.#cleanup = anchorTo(trigger, panel, this.placement);
      this.focusPanel();
      this.dispatchEvent(new Event('elo-open', { bubbles: true, composed: true }));
    } else if (!this.open && this.#shown) {
      this.#shown = false;
      this.#cleanup?.();
      this.#cleanup = undefined;
      const focusWasInside =
        this.#focusWasInside || composedContains(panel, getDeepActiveElement());
      this.#focusWasInside = false;
      if (panel.matches(':popover-open')) panel.hidePopover();
      if (focusWasInside) trigger?.focus();
      this.dispatchEvent(new Event('elo-close', { bubbles: true, composed: true }));
    }
  }

  // By `toggle`, the browser has already dropped focus from the hidden panel; record it first.
  protected onPanelBeforeToggle = (event: Event): void => {
    const panel = this.panel;
    if ((event as ToggleEvent).newState === 'closed' && panel) {
      this.#focusWasInside = composedContains(panel, getDeepActiveElement());
    }
  };

  // Light dismiss (outside click, Esc) closes the native popover; mirror it into `open`.
  protected onPanelToggle = (event: Event): void => {
    if ((event as ToggleEvent).newState === 'closed' && this.open) this.open = false;
  };

  // Light dismiss closes on pointer-down, so a trigger click must not reopen what it just closed.
  #onTriggerPointerDown = (): void => {
    this.#wasOpenOnPointerDown = this.panel?.matches(':popover-open') ?? false;
  };

  #onTriggerClick = (): void => {
    const wasOpen = this.#wasOpenOnPointerDown ?? this.open;
    this.#wasOpenOnPointerDown = undefined;
    this.open = !wasOpen;
  };

  protected onFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget as Node | null;
    if (!this.open || !next) return;
    const panel = this.panel;
    if (composedContains(this, next) || (panel && composedContains(panel, next))) return;
    this.open = false;
  };

  #onTriggerSlotChange = (): void => {
    const trigger = this.trigger;
    if (trigger) setTriggerState(trigger, { expanded: this.open, haspopup: this.popupType });
  };

  protected renderTrigger(): TemplateResult {
    // eslint-disable-next-line lit-a11y/click-events-have-key-events -- clicks come from the trigger button
    return html`<slot
      name="trigger"
      @slotchange=${this.#onTriggerSlotChange}
      @pointerdown=${this.#onTriggerPointerDown}
      @click=${this.#onTriggerClick}
    ></slot>`;
  }
}
