import { LitElement, css, html, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import {
  RovingTabindexController,
  defineElement,
  getTabbableElements,
  hostStyles,
} from '@elo-ui/core';
import { EloTab } from '../tab/tab.js';
import { EloTabPanel } from '../tab-panel/tab-panel.js';

export interface TabsChangeDetail {
  value: string;
}

let nextId = 0;

/**
 * Tabs that switch between panels, following the WAI-ARIA tabs pattern.
 *
 * @tag elo-tabs
 *
 * @slot - `<elo-tab-panel>` elements.
 * @slot nav - `<elo-tab>` elements.
 *
 * @csspart tablist - The row (or column) of tabs.
 *
 * @fires {CustomEvent<TabsChangeDetail>} elo-change - When the user selects a different tab.
 */
export class EloTabs extends LitElement {
  static override styles = [
    hostStyles,
    css`
      :host {
        display: block;
        color: var(--elo-color-fg);
      }

      .tablist {
        display: flex;
        gap: var(--elo-space-1);
        overflow-x: auto;
        border-bottom: var(--elo-border-width) solid var(--elo-color-border);
        scrollbar-width: thin;
      }

      :host([orientation='vertical']) {
        display: flex;
        gap: var(--elo-space-5);
      }

      :host([orientation='vertical']) .tablist {
        flex-direction: column;
        flex-shrink: 0;
        border-bottom: 0;
        border-inline-end: var(--elo-border-width) solid var(--elo-color-border);
      }

      :host([orientation='vertical']) .panels {
        flex: 1;
        min-width: 0;
      }

      :host([orientation='vertical']) ::slotted(elo-tab-panel) {
        padding-block: 0;
      }
    `,
  ];

  /** The `panel` name of the selected tab. Defaults to the first enabled tab. */
  @property({ reflect: true }) accessor value = '';

  /** Accessible name for the tab list. */
  @property() accessor label = '';

  /** Layout of the tab list. */
  @property({ reflect: true }) accessor orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** `automatic` selects tabs as arrow keys move focus; `manual` waits for Enter or Space. */
  @property() accessor activation: 'automatic' | 'manual' = 'automatic';

  readonly #roving = new RovingTabindexController(this, {
    items: () => this.tabs,
    orientation: 'both',
    onActiveChange: (tab) => {
      if (this.activation === 'automatic') this.#select(tab as EloTab, true);
    },
  });

  constructor() {
    super();
    this.addEventListener('click', this.#onClick);
    this.addEventListener('keydown', this.#onKeyDown);
  }

  /** The tabs, in order. */
  get tabs(): EloTab[] {
    return [...this.querySelectorAll<EloTab>(':scope > elo-tab')];
  }

  /** The panels, in order. */
  get panels(): EloTabPanel[] {
    return [...this.querySelectorAll<EloTabPanel>(':scope > elo-tab-panel')];
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this.#sync();
  }

  #sync = (): void => {
    const tabs = this.tabs;
    const panels = this.panels;
    const vertical = this.orientation === 'vertical';
    const enabled = tabs.filter((tab) => !tab.disabled);
    if (!enabled.some((tab) => tab.panel === this.value) && enabled[0]) {
      this.value = enabled[0].panel;
    }

    for (const tab of tabs) {
      tab.slot = 'nav';
      tab.id ||= `elo-tab-${++nextId}`;
      tab.selected = tab.panel === this.value;
      tab.toggleAttribute('data-vertical', vertical);
      const panel = panels.find((p) => p.name === tab.panel);
      if (panel) {
        panel.id ||= `elo-tab-panel-${++nextId}`;
        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', tab.id);
      }
    }
    for (const panel of panels) {
      panel.hidden = panel.name !== this.value;
      // Panels without focusable content take focus themselves, so Tab reaches the content.
      if (getTabbableElements(panel).length === 0) panel.tabIndex = 0;
      else panel.removeAttribute('tabindex');
    }

    const selected = tabs.find((tab) => tab.selected);
    if (selected) this.#roving.setActiveItem(selected);
  };

  #select(tab: EloTab, fromUser: boolean): void {
    if (tab.disabled || tab.panel === this.value) return;
    this.value = tab.panel;
    if (fromUser) {
      this.dispatchEvent(
        new CustomEvent<TabsChangeDetail>('elo-change', {
          bubbles: true,
          composed: true,
          detail: { value: tab.panel },
        }),
      );
    }
  }

  #tabFromEvent(event: Event): EloTab | undefined {
    return event.composedPath().find((node): node is EloTab => node instanceof EloTab);
  }

  #onClick = (event: MouseEvent): void => {
    const tab = this.#tabFromEvent(event);
    if (tab) this.#select(tab, true);
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    const tab = this.#tabFromEvent(event);
    if (tab && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.#select(tab, true);
    }
  };

  override render(): TemplateResult {
    return html`<div
        part="tablist"
        class="tablist"
        role="tablist"
        aria-label=${this.label}
        aria-orientation=${this.orientation}
      >
        <slot name="nav" @slotchange=${this.#sync}></slot>
      </div>
      <div class="panels"><slot @slotchange=${this.#sync}></slot></div>`;
  }
}

defineElement('elo-tabs', EloTabs);

declare global {
  interface HTMLElementTagNameMap {
    'elo-tabs': EloTabs;
  }
}
