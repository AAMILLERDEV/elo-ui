import { css, html, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement, getTabbableElements, hostStyles } from '@elo-ui/core';
import { floatingStyles } from '../shared/floating.js';
import { Popup } from '../shared/popup.js';

/**
 * A non-modal panel anchored to a trigger, for filters, quick edits, and details.
 *
 * @tag elo-popover
 *
 * @slot trigger - The element that opens the popover, usually an `<elo-button>`.
 * @slot - The popover content.
 *
 * @csspart panel - The floating panel.
 *
 * @fires elo-open - After the popover opens.
 * @fires elo-close - After the popover closes.
 */
export class EloPopover extends Popup {
  static override styles = [
    hostStyles,
    floatingStyles,
    css`
      :host {
        display: inline-block;
      }

      .panel {
        padding: var(--elo-space-4);
      }

      .panel:focus {
        outline: none;
      }
    `,
  ];

  /** Accessible name for the panel, announced when focus moves into it. */
  @property() accessor label: string | undefined;

  #warnedMissingLabel = false;

  protected get popupType(): 'dialog' {
    return 'dialog';
  }

  protected focusPanel(): void {
    const panel = this.panel;
    if (!panel) return;
    const [first] = getTabbableElements(panel);
    (first ?? panel).focus();
  }

  protected override firstUpdated(changed: PropertyValues<this>): void {
    super.firstUpdated(changed);
    if (!this.label && !this.#warnedMissingLabel) {
      this.#warnedMissingLabel = true;
      console.warn('[elo-ui] <elo-popover> needs a `label` for its accessible name.', this);
    }
  }

  override render(): TemplateResult {
    return html`${this.renderTrigger()}
      <div
        popover="auto"
        part="panel"
        class="panel"
        role="dialog"
        aria-label=${this.label ?? ''}
        tabindex="-1"
        @beforetoggle=${this.onPanelBeforeToggle}
        @toggle=${this.onPanelToggle}
      >
        <slot></slot>
      </div>`;
  }
}

defineElement('elo-popover', EloPopover);

declare global {
  interface HTMLElementTagNameMap {
    'elo-popover': EloPopover;
  }
}
