import type { ReactiveController, ReactiveControllerHost } from 'lit';

export interface TypeaheadOptions {
  /** The searchable items, in order. */
  items: () => HTMLElement[];
  /** Called with the matching item. Typically moves focus or the active descendant to it. */
  onMatch: (item: HTMLElement) => void;
  /** An item's searchable text. Defaults to `aria-label`, then text content. */
  getLabel?: (item: HTMLElement) => string;
  /** Items to skip. Defaults to `disabled` or `aria-disabled="true"` items. */
  isDisabled?: (item: HTMLElement) => boolean;
  /** Milliseconds of inactivity before the typed string resets. Defaults to 500. */
  timeout?: number;
}

const defaultLabel = (item: HTMLElement) =>
  item.getAttribute('aria-label') ?? item.textContent ?? '';

const defaultIsDisabled = (item: HTMLElement) =>
  item.hasAttribute('disabled') || item.getAttribute('aria-disabled') === 'true';

/**
 * Type-ahead (WAI-ARIA APG): typing characters moves to the next item whose label starts with
 * them. Typing the same character repeatedly cycles through items starting with it.
 *
 * The host calls `handleKeyDown()` from its own keydown handler, so it decides precedence over
 * other keys.
 */
export class TypeaheadController implements ReactiveController {
  readonly #options: TypeaheadOptions;
  #buffer = '';
  #timer: ReturnType<typeof setTimeout> | undefined;

  constructor(host: ReactiveControllerHost, options: TypeaheadOptions) {
    this.#options = options;
    host.addController(this);
  }

  hostDisconnected(): void {
    this.reset();
  }

  /** Clears the typed string. */
  reset(): void {
    clearTimeout(this.#timer);
    this.#buffer = '';
  }

  /**
   * Handles a keydown. Returns `true` (and prevents the default action) when the key matched
   * an item. `current` is the item to search after, usually the focused one.
   */
  handleKeyDown(event: KeyboardEvent, current: HTMLElement | null): boolean {
    if (event.ctrlKey || event.metaKey || event.altKey) return false;
    if ([...event.key].length !== 1) return false;
    if (event.key === ' ' && this.#buffer === '') return false;

    this.#buffer += event.key.toLocaleLowerCase();
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => (this.#buffer = ''), this.#options.timeout ?? 500);

    const match = this.#find(current);
    if (!match) return false;

    event.preventDefault();
    this.#options.onMatch(match);
    return true;
  }

  #find(current: HTMLElement | null): HTMLElement | undefined {
    const isDisabled = this.#options.isDisabled ?? defaultIsDisabled;
    const getLabel = this.#options.getLabel ?? defaultLabel;
    const items = this.#options.items().filter((item) => !isDisabled(item));
    if (items.length === 0) return undefined;

    const chars = [...this.#buffer];
    const repeated = chars.every((char) => char === chars[0]);
    const search = repeated ? chars[0]! : this.#buffer;
    // A new or repeated character searches after the current item; a longer string includes it.
    const startOffset = repeated ? 1 : 0;
    const start = Math.max(items.indexOf(current as HTMLElement), 0) + startOffset;

    for (let i = 0; i < items.length; i++) {
      const item = items[(start + i) % items.length]!;
      if (getLabel(item).trim().toLocaleLowerCase().startsWith(search)) return item;
    }
    return undefined;
  }
}
