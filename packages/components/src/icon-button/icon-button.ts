import { css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '@elo-ui/core';
import { EloButton, type ButtonVariant } from '../button/button.js';
import '../tooltip/tooltip.js';

/**
 * A square button showing only an icon. Its `label` is the accessible name and appears as a tooltip.
 *
 * @tag elo-icon-button
 *
 * @slot - The icon, usually an `<svg aria-hidden="true">`.
 *
 * @csspart base - The native `<button>` or `<a>` element.
 */
export class EloIconButton extends EloButton {
  static override styles = [
    ...EloButton.styles,
    css`
      elo-tooltip {
        display: block;
      }

      /* The icon sits in the default slot, which buttons hide when it has no text. */
      .control .label[hidden] {
        display: inline-flex !important;
      }
    `,
  ];

  /** Visual style. Icon buttons default to `ghost`. */
  @property({ reflect: true }) override accessor variant: ButtonVariant = 'ghost';

  /** Hides the hover and focus tooltip. The label is still announced. */
  @property({ type: Boolean, attribute: 'no-tooltip' }) accessor noTooltip = false;

  override render(): TemplateResult {
    const button = super.render();
    if (this.noTooltip || !this.label) return button;
    // The label is already the button's name, so the tooltip mustn't repeat it as a description.
    return html`<elo-tooltip content=${this.label} .describe=${false}>${button}</elo-tooltip>`;
  }
}

defineElement('elo-icon-button', EloIconButton);

declare global {
  interface HTMLElementTagNameMap {
    'elo-icon-button': EloIconButton;
  }
}
