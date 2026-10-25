import type { ReactiveController, ReactiveControllerHost } from 'lit';

export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

export interface RovingTabindexOptions {
  /** The items, in order. Called whenever the controller needs them, so it may change. */
  items: () => HTMLElement[];
  /** Which arrow keys move focus. Defaults to `'both'`. */
  orientation?: RovingOrientation;
  /** Wrap from the last item to the first and back. Defaults to `true`. */
  wrap?: boolean;
  /** Items that arrow keys skip. Defaults to `disabled` or `aria-disabled="true"` items. */
  isDisabled?: (item: HTMLElement) => boolean;
  /** Called when the active item changes, by keyboard, click, or `setActiveItem()`. */
  onActiveChange?: (item: HTMLElement) => void;
}

const defaultIsDisabled = (item: HTMLElement) =>
  item.hasAttribute('disabled') || item.getAttribute('aria-disabled') === 'true';

/** APG roving tabindex: one Tab stop; arrows, Home, and End move between items (RTL-aware). */
export class RovingTabindexController implements ReactiveController {
  readonly #host: ReactiveControllerHost & HTMLElement;
  readonly #options: RovingTabindexOptions;
  #activeItem: HTMLElement | null = null;

  constructor(host: ReactiveControllerHost & HTMLElement, options: RovingTabindexOptions) {
    this.#host = host;
    this.#options = options;
    host.addController(this);
  }

  /** The item that currently has `tabindex="0"`. */
  get activeItem(): HTMLElement | null {
    return this.#activeItem;
  }

  hostConnected(): void {
    this.#host.addEventListener('keydown', this.#onKeyDown);
    this.#host.addEventListener('focusin', this.#onFocusIn);
  }

  hostDisconnected(): void {
    this.#host.removeEventListener('keydown', this.#onKeyDown);
    this.#host.removeEventListener('focusin', this.#onFocusIn);
  }

  hostUpdated(): void {
    this.sync();
  }

  /** Re-applies tabindex; runs after each update, call it when items change outside a render. */
  sync(): void {
    const items = this.#options.items();
    const isDisabled = this.#options.isDisabled ?? defaultIsDisabled;
    if (!this.#activeItem || !items.includes(this.#activeItem) || isDisabled(this.#activeItem)) {
      this.#activeItem = items.find((item) => !isDisabled(item)) ?? null;
    }
    for (const item of items) {
      item.tabIndex = item === this.#activeItem ? 0 : -1;
    }
  }

  /** Makes `item` the Tab stop, and optionally focuses it. */
  setActiveItem(item: HTMLElement, { focus = false } = {}): void {
    if (!this.#options.items().includes(item)) return;
    const changed = item !== this.#activeItem;
    this.#activeItem = item;
    this.sync();
    if (focus) item.focus();
    if (changed) this.#options.onActiveChange?.(item);
  }

  #itemFromEvent(event: Event): HTMLElement | undefined {
    const path = event.composedPath();
    return this.#options.items().find((item) => path.includes(item));
  }

  #onFocusIn = (event: FocusEvent): void => {
    const item = this.#itemFromEvent(event);
    if (item && item !== this.#activeItem) this.setActiveItem(item);
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const current = this.#itemFromEvent(event);
    if (!current) return;

    const step = this.#stepFor(event.key);
    if (step === null) return;

    const isDisabled = this.#options.isDisabled ?? defaultIsDisabled;
    const items = this.#options.items().filter((item) => item === current || !isDisabled(item));
    const index = items.indexOf(current);
    const wrap = this.#options.wrap ?? true;

    let next: HTMLElement | undefined;
    if (step === 'first') {
      next = items.find((item) => !isDisabled(item));
    } else if (step === 'last') {
      next = items.findLast((item) => !isDisabled(item));
    } else {
      for (let i = 1; i < items.length; i++) {
        let target = index + step * i;
        if (wrap) target = (target + items.length) % items.length;
        const candidate = items[target];
        if (!candidate) break;
        if (!isDisabled(candidate)) {
          next = candidate;
          break;
        }
      }
    }

    if (next && next !== current) {
      event.preventDefault();
      this.setActiveItem(next, { focus: true });
    } else if (next === current) {
      event.preventDefault();
    }
  };

  #stepFor(key: string): 1 | -1 | 'first' | 'last' | null {
    const orientation = this.#options.orientation ?? 'both';
    const horizontal = orientation !== 'vertical';
    const vertical = orientation !== 'horizontal';
    const rtl = getComputedStyle(this.#host).direction === 'rtl';

    switch (key) {
      case 'ArrowRight':
        return horizontal ? (rtl ? -1 : 1) : null;
      case 'ArrowLeft':
        return horizontal ? (rtl ? 1 : -1) : null;
      case 'ArrowDown':
        return vertical ? 1 : null;
      case 'ArrowUp':
        return vertical ? -1 : null;
      case 'Home':
        return 'first';
      case 'End':
        return 'last';
      default:
        return null;
    }
  }
}
