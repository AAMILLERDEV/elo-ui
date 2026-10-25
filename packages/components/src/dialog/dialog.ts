import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { defineElement, focusRingStyles, getDeepActiveElement, hostStyles } from '@elo-ui/core';

export type DialogPlacement = 'center' | 'start' | 'end';
export type DialogSize = 'sm' | 'md' | 'lg';
export type DialogCloseSource = 'escape' | 'backdrop' | 'close-button';

export interface DialogRequestCloseDetail {
  source: DialogCloseSource;
}

let scrollLocks = 0;
let savedOverflow = '';

function lockScroll(): void {
  if (scrollLocks++ === 0) {
    savedOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }
}

function unlockScroll(): void {
  if (--scrollLocks === 0) document.documentElement.style.overflow = savedOverflow;
}

/**
 * A modal dialog built on the native `<dialog>`. Set `placement="start"` or `"end"` for a side drawer.
 *
 * @tag elo-dialog
 *
 * @slot - The dialog body.
 * @slot label - Rich title content, instead of the `label` attribute.
 * @slot footer - Actions, usually buttons.
 *
 * @csspart dialog - The native dialog element.
 * @csspart header - The header containing the title and close button.
 * @csspart title - The title.
 * @csspart close-button - The close button.
 * @csspart body - The scrollable body.
 * @csspart footer - The footer.
 *
 * @fires elo-open - After the dialog opens.
 * @fires elo-close - After the dialog closes.
 * @fires {CustomEvent<DialogRequestCloseDetail>} elo-request-close - Before the user closes it with Escape, the backdrop, or the close button. Cancel it to keep the dialog open.
 */
export class EloDialog extends LitElement {
  static override styles = [
    hostStyles,
    focusRingStyles,
    css`
      dialog {
        width: var(--_width);
        max-width: calc(100vw - 2rem);
        max-height: calc(100dvh - 2rem);
        padding: 0;
        color: var(--elo-color-fg);
        font-family: var(--elo-font-family);
        font-size: var(--elo-font-size-md);
        line-height: var(--elo-line-height);
        background: transparent;
        border: 0;
        overflow: visible;
        --_width: 32rem;
      }

      :host([size='sm']) dialog {
        --_width: 24rem;
      }

      :host([size='lg']) dialog {
        --_width: 48rem;
      }

      dialog::backdrop {
        background: var(--elo-color-backdrop, rgb(9 9 11 / 0.5));
      }

      dialog[open] {
        animation: elo-dialog-in var(--elo-duration-normal) var(--elo-easing);
      }

      .panel {
        display: flex;
        flex-direction: column;
        max-height: inherit;
        background: var(--elo-color-surface);
        border: var(--elo-border-width) solid var(--elo-color-border);
        border-radius: var(--elo-radius-lg);
        box-shadow: var(--elo-shadow-lg);
      }

      header {
        display: flex;
        gap: var(--elo-space-3);
        align-items: flex-start;
        padding: var(--elo-space-5) var(--elo-space-5) 0;
      }

      h2 {
        flex: 1;
        margin: 0;
        font-size: var(--elo-font-size-lg);
        font-weight: var(--elo-font-weight-semibold);
        line-height: 1.4;
      }

      .close {
        display: grid;
        place-items: center;
        width: 2rem;
        height: 2rem;
        margin: -0.25rem -0.5rem 0 0;
        padding: 0;
        color: var(--elo-color-fg-muted);
        background: none;
        border: 0;
        border-radius: var(--elo-radius-md);
        cursor: pointer;
      }

      .close:hover {
        color: var(--elo-color-fg);
        background: var(--elo-color-surface-hover);
      }

      .close svg {
        width: 1rem;
        height: 1rem;
      }

      .body {
        flex: 1;
        padding: var(--elo-space-4) var(--elo-space-5);
        overflow: auto;
      }

      footer {
        display: flex;
        flex-wrap: wrap;
        gap: var(--elo-space-2);
        justify-content: flex-end;
        padding: 0 var(--elo-space-5) var(--elo-space-5);
      }

      [hidden] {
        display: none !important;
      }

      /* Drawer */
      :host([placement='start']) dialog,
      :host([placement='end']) dialog {
        height: 100dvh;
        max-height: 100dvh;
        margin-block: 0;
        --_width: 28rem;
      }

      :host([placement='start']) dialog {
        margin-inline: 0 auto;
        animation-name: elo-drawer-in-start;
      }

      :host([placement='end']) dialog {
        margin-inline: auto 0;
        animation-name: elo-drawer-in-end;
      }

      :host([placement='start']) .panel,
      :host([placement='end']) .panel {
        height: 100%;
        border-block: 0;
        border-radius: 0;
      }

      @keyframes elo-dialog-in {
        from {
          opacity: 0;
          scale: 0.97;
        }
      }

      @keyframes elo-drawer-in-start {
        from {
          translate: -100% 0;
        }
      }

      @keyframes elo-drawer-in-end {
        from {
          translate: 100% 0;
        }
      }

      :host(:dir(rtl)[placement='start']) dialog {
        animation-name: elo-drawer-in-end;
      }

      :host(:dir(rtl)[placement='end']) dialog {
        animation-name: elo-drawer-in-start;
      }

      @media (prefers-reduced-motion: reduce) {
        dialog[open] {
          animation: none;
        }
      }

      @media (forced-colors: active) {
        .panel {
          border: 1px solid CanvasText;
        }
      }
    `,
  ];

  /** Whether the dialog is open. */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /** The dialog title, also its accessible name. Use the `label` slot for rich content. */
  @property() accessor label: string | undefined;

  /** Where the dialog appears: centered, or as a drawer from the start or end edge. */
  @property({ reflect: true }) accessor placement: DialogPlacement = 'center';

  /** Width of a centered dialog. */
  @property({ reflect: true }) accessor size: DialogSize = 'md';

  /** Accessible name of the close button. Translate it for other languages. */
  @property({ attribute: 'close-label' }) accessor closeLabel = 'Close';

  /** Hides the close button. Escape still closes the dialog. */
  @property({ type: Boolean, attribute: 'no-close-button' }) accessor noCloseButton = false;

  /** Keeps the dialog open when the backdrop is clicked. */
  @property({ type: Boolean, attribute: 'no-light-dismiss' }) accessor noLightDismiss = false;

  @query('dialog') private accessor dialog: HTMLDialogElement | null = null;

  @state() private accessor hasFooter = false;

  #shown = false;
  #returnFocus: HTMLElement | null = null;
  #pointerDownOnBackdrop = false;

  show(): void {
    this.open = true;
  }

  close(): void {
    this.open = false;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.#shown) {
      this.#shown = false;
      unlockScroll();
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (changed.has('open')) this.#sync();
  }

  #sync(): void {
    const dialog = this.dialog;
    if (!dialog) return;
    if (this.open && !this.#shown) {
      this.#shown = true;
      this.#returnFocus = getDeepActiveElement() as HTMLElement | null;
      lockScroll();
      dialog.showModal();
      // The native dialog only honors autofocus in its own tree, not in slotted content.
      this.querySelector<HTMLElement>('[autofocus]')?.focus();
      this.dispatchEvent(new Event('elo-open', { bubbles: true, composed: true }));
    } else if (!this.open && this.#shown) {
      this.#shown = false;
      if (dialog.open) dialog.close();
      unlockScroll();
      if (this.#returnFocus?.isConnected) this.#returnFocus.focus();
      this.#returnFocus = null;
      this.dispatchEvent(new Event('elo-close', { bubbles: true, composed: true }));
    }
  }

  #requestClose(source: DialogCloseSource): void {
    const event = new CustomEvent<DialogRequestCloseDetail>('elo-request-close', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { source },
    });
    if (this.dispatchEvent(event)) this.open = false;
  }

  // Esc fires `cancel`; route it through elo-request-close so apps can keep the dialog open.
  #onCancel = (event: Event): void => {
    event.preventDefault();
    this.#requestClose('escape');
  };

  // The browser may still force-close (repeated Esc); keep `open` in sync.
  #onNativeClose = (): void => {
    if (this.open) this.open = false;
  };

  // The panel fills the dialog, so a press and release directly on the dialog is on the backdrop.
  #onPointerDown = (event: PointerEvent): void => {
    this.#pointerDownOnBackdrop = event.target === this.dialog;
  };

  #onClick = (event: MouseEvent): void => {
    const onBackdrop = this.#pointerDownOnBackdrop && event.target === this.dialog;
    this.#pointerDownOnBackdrop = false;
    if (onBackdrop && !this.noLightDismiss) this.#requestClose('backdrop');
  };

  #onFooterSlotChange = (event: Event): void => {
    this.hasFooter = (event.target as HTMLSlotElement).assignedNodes({ flatten: true }).length > 0;
  };

  override render(): TemplateResult {
    // eslint-disable-next-line lit-a11y/click-events-have-key-events -- backdrop only; Escape is the keyboard path
    return html`<dialog
      part="dialog"
      aria-labelledby="title"
      @cancel=${this.#onCancel}
      @close=${this.#onNativeClose}
      @pointerdown=${this.#onPointerDown}
      @click=${this.#onClick}
    >
      <div class="panel">
        <header part="header">
          <h2 id="title" part="title"><slot name="label">${this.label}</slot></h2>
          ${
            this.noCloseButton
              ? nothing
              : html`<button
                  part="close-button"
                  class="close focus-ring"
                  aria-label=${this.closeLabel}
                  @click=${() => this.#requestClose('close-button')}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </button>`
          }
        </header>
        <div part="body" class="body"><slot></slot></div>
        <footer part="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${this.#onFooterSlotChange}></slot>
        </footer>
      </div>
    </dialog>`;
  }
}

defineElement('elo-dialog', EloDialog);

declare global {
  interface HTMLElementTagNameMap {
    'elo-dialog': EloDialog;
  }
}
