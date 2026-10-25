import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineElement, focusRingStyles, hostStyles } from '@elo-ui/core';
import { buttonStyles } from './button.styles.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * A button for actions, form submission, or navigation.
 *
 * @tag elo-button
 *
 * @slot - The button's label.
 * @slot start - Content before the label, such as an icon.
 * @slot end - Content after the label, such as an icon.
 *
 * @csspart base - The native `<button>` or `<a>` element.
 * @csspart start - Wrapper around the `start` slot.
 * @csspart label - Wrapper around the default slot.
 * @csspart end - Wrapper around the `end` slot.
 * @csspart spinner - The loading spinner.
 */
export class EloButton extends LitElement {
  static override styles = [hostStyles, focusRingStyles, buttonStyles];
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  static formAssociated = true;

  readonly #internals = this.attachInternals();
  #warnedMissingLabel = false;

  /** Visual style. */
  @property({ reflect: true }) accessor variant: ButtonVariant = 'secondary';

  /** Control size. Heights also follow the active density. */
  @property({ reflect: true }) accessor size: ButtonSize = 'md';

  /** Disables the button. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Shows a spinner and ignores activation while keeping the button focusable. */
  @property({ type: Boolean, reflect: true }) accessor loading = false;

  /** Form behavior, as on a native button. Ignored when `href` is set. */
  @property({ reflect: true }) accessor type: ButtonType = 'button';

  /** Submitted with the form when this button submits it. */
  @property() accessor name: string | undefined;

  /** Submitted with the form, paired with `name`, when this button submits it. */
  @property() accessor value: string | undefined;

  /** Renders the button as a link to this URL. */
  @property() accessor href: string | undefined;

  /** Link target, when `href` is set. */
  @property() accessor target: string | undefined;

  /** Link relationship, when `href` is set. Defaults to `noopener noreferrer` for `_blank`. */
  @property() accessor rel: string | undefined;

  /** Downloads the linked URL instead of navigating, when `href` is set. */
  @property() accessor download: string | undefined;

  /** Accessible name. Required for icon-only buttons with no visible text. */
  @property() accessor label: string | undefined;

  @state() private accessor formDisabled = false;
  @state() private accessor hasStart = false;
  @state() private accessor hasEnd = false;
  @state() private accessor hasText = true;

  constructor() {
    super();
    // Capture on the host so no listener (inside or outside) sees activation while inert.
    this.addEventListener('click', this.#guardClick, { capture: true });
  }

  /** The form this button is associated with, if any. */
  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  /** Clicks the inner control, so programmatic clicks behave like user clicks. */
  override click(): void {
    this.renderRoot.querySelector<HTMLElement>('.control')?.click();
  }

  /** @internal */
  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  get #isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  #guardClick = (event: MouseEvent): void => {
    if (this.#isDisabled || this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  #handleClick = (): void => {
    const form = this.#internals.form;
    if (this.href !== undefined || form === null) return;

    if (this.type === 'submit') {
      this.#submit(form);
    } else if (this.type === 'reset') {
      form.reset();
    }
  };

  /** Submits through a temporary native button so name/value, validation, and submitter work. */
  #submit(form: HTMLFormElement): void {
    const proxy = document.createElement('button');
    proxy.type = 'submit';
    proxy.hidden = true;
    if (this.name !== undefined) {
      proxy.name = this.name;
      proxy.value = this.value ?? '';
    }
    form.append(proxy);
    try {
      form.requestSubmit(proxy);
    } finally {
      proxy.remove();
    }
  }

  override firstUpdated(): void {
    // slotchange doesn't fire for slots that start empty, so check every slot once.
    this.renderRoot.querySelectorAll('slot').forEach((slot) => this.#updateSlot(slot));
  }

  #handleSlotChange = (event: Event): void => {
    this.#updateSlot(event.target as HTMLSlotElement);
  };

  #updateSlot(slot: HTMLSlotElement): void {
    const nodes = slot.assignedNodes({ flatten: true });
    const hasContent = nodes.some(
      (node) => node.nodeType === Node.ELEMENT_NODE || node.textContent?.trim(),
    );

    if (slot.name === 'start') {
      this.hasStart = hasContent;
    } else if (slot.name === 'end') {
      this.hasEnd = hasContent;
    } else {
      this.hasText = nodes.some((node) => node.textContent?.trim());
      this.#checkAccessibleName();
    }
  }

  #checkAccessibleName(): void {
    if (this.hasText || this.label || this.#warnedMissingLabel) return;
    this.#warnedMissingLabel = true;
    console.warn(
      '[elo-ui] <elo-button> has no text content. Set the `label` attribute so it has an accessible name.',
      this,
    );
  }

  #renderContent(): TemplateResult {
    return html`
      <span part="start" class="start" ?hidden=${!this.hasStart}>
        <slot name="start" @slotchange=${this.#handleSlotChange}></slot>
      </span>
      <span part="label" class="label" ?hidden=${!this.hasText}>
        <slot @slotchange=${this.#handleSlotChange}></slot>
      </span>
      <span part="end" class="end" ?hidden=${!this.hasEnd}>
        <slot name="end" @slotchange=${this.#handleSlotChange}></slot>
      </span>
      ${this.loading ? html`<span part="spinner" class="spinner" aria-hidden="true"></span>` : nothing}
    `;
  }

  override render(): TemplateResult {
    const disabled = this.#isDisabled;
    const classes = classMap({
      control: true,
      'focus-ring': true,
      'is-disabled': disabled,
      'is-loading': this.loading,
      'icon-only': !this.hasText,
    });

    if (this.href !== undefined) {
      const rel = this.rel ?? (this.target === '_blank' ? 'noopener noreferrer' : undefined);
      // A disabled link has no href, so it is not focusable or navigable.
      return html`<a
        part="base"
        class=${classes}
        href=${ifDefined(disabled ? undefined : this.href)}
        target=${ifDefined(this.target)}
        rel=${ifDefined(rel)}
        download=${ifDefined(this.download)}
        role=${ifDefined(disabled ? 'link' : undefined)}
        aria-disabled=${ifDefined(disabled || this.loading ? 'true' : undefined)}
        aria-label=${ifDefined(this.label)}
        @click=${this.#handleClick}
        >${this.#renderContent()}</a
      >`;
    }

    return html`<button
      part="base"
      class=${classes}
      type="button"
      ?disabled=${disabled}
      aria-disabled=${ifDefined(this.loading ? 'true' : undefined)}
      aria-label=${ifDefined(this.label)}
      @click=${this.#handleClick}
    >
      ${this.#renderContent()}
    </button>`;
  }
}

defineElement('elo-button', EloButton);

declare global {
  interface HTMLElementTagNameMap {
    'elo-button': EloButton;
  }
}
