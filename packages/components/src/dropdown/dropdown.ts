import { css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import {
  RovingTabindexController,
  TypeaheadController,
  defineElement,
  hostStyles,
} from '@elo-ui/core';
import { floatingStyles } from '../shared/floating.js';
import { Popup } from '../shared/popup.js';
import { EloMenuItem } from '../menu-item/menu-item.js';

export interface DropdownSelectDetail {
  item: EloMenuItem;
  value: string;
}

/**
 * A menu of actions opened from a trigger button, following the WAI-ARIA menu button pattern.
 *
 * @tag elo-dropdown
 *
 * @slot trigger - The button that opens the menu, usually an `<elo-button>`.
 * @slot - `<elo-menu-item>` and `<elo-menu-separator>` elements.
 *
 * @csspart menu - The floating menu.
 *
 * @fires {CustomEvent<DropdownSelectDetail>} elo-select - When the user chooses an item. Cancel it to keep the menu open.
 * @fires elo-open - After the menu opens.
 * @fires elo-close - After the menu closes.
 */
export class EloDropdown extends Popup {
  static override styles = [
    hostStyles,
    floatingStyles,
    css`
      :host {
        display: inline-block;
      }

      .menu {
        padding: var(--elo-space-1);
      }
    `,
  ];

  /** Accessible name for the menu. Defaults to the trigger's text. */
  @property() accessor label: string | undefined;

  #focusLast = false;

  readonly #roving = new RovingTabindexController(this, {
    items: () => this.items,
    orientation: 'vertical',
  });

  readonly #typeahead = new TypeaheadController(this, {
    items: () => this.items,
    onMatch: (item) => this.#roving.setActiveItem(item, { focus: true }),
  });

  constructor() {
    super();
    this.addEventListener('keydown', this.#onKeyDown);
    this.addEventListener('click', this.#onClick);
  }

  /** The menu items, in order. */
  get items(): EloMenuItem[] {
    return [...this.querySelectorAll<EloMenuItem>('elo-menu-item')];
  }

  protected get popupType(): 'menu' {
    return 'menu';
  }

  protected focusPanel(): void {
    const enabled = this.items.filter((item) => !item.disabled);
    const target = this.#focusLast ? enabled.at(-1) : enabled[0];
    this.#focusLast = false;
    if (target) this.#roving.setActiveItem(target, { focus: true });
  }

  #itemFromEvent(event: Event): EloMenuItem | undefined {
    return event.composedPath().find((node): node is EloMenuItem => node instanceof EloMenuItem);
  }

  #isFromTrigger(event: Event): boolean {
    const trigger = this.trigger;
    return Boolean(trigger && event.composedPath().includes(trigger));
  }

  #choose(item: EloMenuItem): void {
    if (item.disabled) return;
    const value = item.value ?? item.textContent?.trim() ?? '';
    const event = new CustomEvent<DropdownSelectDetail>('elo-select', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { item, value },
    });
    if (this.dispatchEvent(event)) {
      this.trigger?.focus();
      this.open = false;
    }
  }

  #onClick = (event: MouseEvent): void => {
    const item = this.#itemFromEvent(event);
    if (item) this.#choose(item);
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    if (this.#isFromTrigger(event)) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.#focusLast = event.key === 'ArrowUp';
        if (this.open) this.focusPanel();
        else this.open = true;
      }
      return;
    }

    const item = this.#itemFromEvent(event);
    if (!item) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.#choose(item);
    } else if (event.key === 'Tab') {
      this.open = false;
    } else {
      this.#typeahead.handleKeyDown(event, item);
    }
  };

  override render(): TemplateResult {
    const name = this.label ?? this.trigger?.textContent?.trim() ?? '';
    return html`${this.renderTrigger()}
      <div
        popover="auto"
        part="menu"
        class="panel menu"
        role="menu"
        aria-label=${name}
        @beforetoggle=${this.onPanelBeforeToggle}
        @toggle=${this.onPanelToggle}
      >
        <slot @slotchange=${() => this.#roving.sync()}></slot>
      </div>`;
  }
}

defineElement('elo-dropdown', EloDropdown);

declare global {
  interface HTMLElementTagNameMap {
    'elo-dropdown': EloDropdown;
  }
}
