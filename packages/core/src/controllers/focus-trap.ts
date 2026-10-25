import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { composedContains, getDeepActiveElement, getTabbableElements } from '../dom.js';

export interface FocusTrapOptions {
  /** The element focus is kept inside. Its shadow roots and slotted content count as inside. */
  container: () => HTMLElement | null | undefined;
  /** What to focus on activation. Defaults to the first tabbable element, then the container. */
  initialFocus?: () => HTMLElement | null | undefined;
  /** Restore focus to the previously focused element on deactivation. Defaults to `true`. */
  returnFocus?: boolean;
}

/** Active traps, innermost last. Only the innermost trap handles focus. */
const trapStack: FocusTrapController[] = [];

/**
 * Keeps keyboard focus inside a container while active: Tab and Shift+Tab wrap around, and focus
 * that escapes (by click or assistive technology) is pulled back. Nested traps stack.
 *
 * Use for non-modal overlays such as drawers and popovers. A modal `<dialog>` opened with
 * `showModal()` already traps focus natively.
 */
export class FocusTrapController implements ReactiveController {
  readonly #options: FocusTrapOptions;
  #previousFocus: HTMLElement | null = null;

  constructor(host: ReactiveControllerHost, options: FocusTrapOptions) {
    this.#options = options;
    host.addController(this);
  }

  get active(): boolean {
    return trapStack.includes(this);
  }

  activate(): void {
    const container = this.#options.container();
    if (this.active || !container) return;

    this.#previousFocus = getDeepActiveElement() as HTMLElement | null;
    if (trapStack.length === 0) {
      document.addEventListener('keydown', onKeyDown, true);
      document.addEventListener('focusin', onFocusIn, true);
    }
    trapStack.push(this);
    this.#focusInitial(container);
  }

  deactivate({ returnFocus = this.#options.returnFocus ?? true } = {}): void {
    const index = trapStack.indexOf(this);
    if (index === -1) return;

    trapStack.splice(index, 1);
    if (trapStack.length === 0) {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
    }
    if (returnFocus && this.#previousFocus?.isConnected) {
      this.#previousFocus.focus();
    }
    this.#previousFocus = null;
  }

  hostDisconnected(): void {
    this.deactivate({ returnFocus: false });
  }

  /** @internal */
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
    const container = this.#options.container();
    if (!container) return;

    const tabbables = getTabbableElements(container);
    if (tabbables.length === 0) {
      event.preventDefault();
      this.#focusContainer(container);
      return;
    }

    const first = tabbables[0]!;
    const last = tabbables[tabbables.length - 1]!;
    const active = getDeepActiveElement();
    const inside = tabbables.includes(active as HTMLElement);

    if (event.shiftKey && (active === first || !inside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !inside)) {
      event.preventDefault();
      first.focus();
    }
  }

  /** @internal */
  handleFocusIn(event: FocusEvent): void {
    const container = this.#options.container();
    if (!container || composedContains(container, event.composedPath()[0] as Node)) return;
    const [first] = getTabbableElements(container);
    if (first) first.focus();
    else this.#focusContainer(container);
  }

  #focusInitial(container: HTMLElement): void {
    const target = this.#options.initialFocus?.() ?? getTabbableElements(container)[0];
    if (target) target.focus();
    else this.#focusContainer(container);
  }

  #focusContainer(container: HTMLElement): void {
    if (!container.hasAttribute('tabindex')) container.tabIndex = -1;
    container.focus();
  }
}

function onKeyDown(event: KeyboardEvent): void {
  trapStack[trapStack.length - 1]?.handleKeyDown(event);
}

function onFocusIn(event: FocusEvent): void {
  trapStack[trapStack.length - 1]?.handleFocusIn(event);
}
