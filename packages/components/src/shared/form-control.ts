import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

type Validatable = HTMLElement & { validity: ValidityState; validationMessage: string };

/** Base for form-associated controls: label, hint, error, validation timing, and form callbacks. */
export abstract class FormControl extends LitElement {
  static formAssociated = true;
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  protected readonly internals = this.attachInternals();
  #customValidity = '';
  #shownError: string | undefined;
  #warnedMissingLabel = false;
  #checking = false;

  /** Name submitted with the form. */
  @property() accessor name: string | undefined;

  /** Visible label. Use the `label` slot for rich content. */
  @property() accessor label: string | undefined;

  /** Help text shown below the control. Use the `hint` slot for rich content. */
  @property() accessor hint: string | undefined;

  /** Error message to show, such as a server-side error. Doesn't block submission. */
  @property() accessor error: string | undefined;

  /** Hides the label visually; screen readers still announce it. */
  @property({ type: Boolean, attribute: 'hide-label' }) accessor hideLabel = false;

  /** Disables the control. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Requires a value before the form can submit. */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  @state() protected accessor formDisabled = false;
  @state() protected accessor touched = false;
  @state() protected accessor hasLabelSlot = false;
  @state() protected accessor hasHintSlot = false;

  constructor() {
    super();
    // Submit attempts fire `invalid`; our own checkValidity() shouldn't reveal errors.
    this.addEventListener('invalid', () => {
      if (!this.#checking) this.touched = true;
    });
    this.addEventListener('focusout', () => (this.touched = true));
  }

  /** The form this control belongs to, if any. */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    return this.internals.validity;
  }

  get validationMessage(): string {
    return this.internals.validationMessage;
  }

  get willValidate(): boolean {
    return this.internals.willValidate;
  }

  checkValidity(): boolean {
    this.#checking = true;
    try {
      return this.internals.checkValidity();
    } finally {
      this.#checking = false;
    }
  }

  reportValidity(): boolean {
    this.touched = true;
    return this.internals.reportValidity();
  }

  /** Sets a custom error that blocks submission, like the native method. Pass "" to clear. */
  setCustomValidity(message: string): void {
    this.#customValidity = message;
    this.updateValidity();
  }

  /** @internal */
  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  /** @internal */
  formResetCallback(): void {
    this.touched = false;
    this.resetValue();
  }

  protected get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /** The native element whose validity the host mirrors. */
  protected abstract get validationTarget(): Validatable | null;

  /** Where the browser anchors its validation bubble. Defaults to the validation target. */
  protected get validationAnchor(): HTMLElement | null {
    return this.validationTarget;
  }

  /** Restores the value the control had when the page loaded. */
  protected abstract resetValue(): void;

  /** Copies the native element's validity onto the host. */
  protected updateValidity(): void {
    const target = this.validationTarget;
    if (!target) return;
    const anchor = this.validationAnchor ?? undefined;
    if (this.#customValidity) {
      this.internals.setValidity({ customError: true }, this.#customValidity, anchor);
    } else if (target.validity.valid) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(target.validity, target.validationMessage, anchor);
    }
    if (this.visibleError !== this.#shownError) this.requestUpdate();
  }

  /** The error to display: the `error` attribute, or native validation once the user is done. */
  protected get visibleError(): string | undefined {
    if (this.error) return this.error;
    if (this.touched && !this.internals.validity.valid) return this.internals.validationMessage;
    return undefined;
  }

  protected get hasLabel(): boolean {
    return Boolean(this.label) || this.hasLabelSlot;
  }

  protected get hasHint(): boolean {
    return Boolean(this.hint) || this.hasHintSlot;
  }

  /** Space-separated ids of the hint and error, for `aria-describedby`. */
  protected get describedBy(): string | undefined {
    const ids = [this.hasHint && 'hint', this.visibleError && 'error'].filter(Boolean);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    this.#shownError = this.visibleError;
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this.updateValidity();
  }

  protected override firstUpdated(changed: PropertyValues<this>): void {
    super.firstUpdated(changed);
    this.renderRoot
      .querySelectorAll<HTMLSlotElement>('slot[name="label"], slot[name="hint"]')
      .forEach((slot) => this.#updateSlot(slot));
    if (!this.hasLabel && !this.#warnedMissingLabel) {
      this.#warnedMissingLabel = true;
      console.warn(`[elo-ui] <${this.localName}> needs a \`label\` for its accessible name.`, this);
    }
  }

  #updateSlot(slot: HTMLSlotElement): void {
    const has = slot.assignedNodes({ flatten: true }).length > 0;
    if (slot.name === 'label') this.hasLabelSlot = has;
    else this.hasHintSlot = has;
  }

  #onSlotChange = (event: Event) => this.#updateSlot(event.target as HTMLSlotElement);

  /** Label text plus the required marker, without a wrapping element. */
  protected renderLabelContent(): TemplateResult {
    return html`<slot name="label" @slotchange=${this.#onSlotChange}>${this.label}</slot>${
        this.required ? html`<span class="required" aria-hidden="true">*</span>` : nothing
      }`;
  }

  /** A `<label for>` element; use for controls with a single native input. */
  protected renderLabel(): TemplateResult {
    return html`<label
      id="label"
      for="control"
      part="label"
      class=${this.hideLabel ? 'label visually-hidden' : 'label'}
      >${this.renderLabelContent()}</label
    >`;
  }

  /** Hint and error text, referenced by `describedBy`. */
  protected renderHelpText(): TemplateResult {
    const error = this.visibleError;
    return html`
      <div id="hint" part="hint" class="hint" ?hidden=${!this.hasHint}>
        <slot name="hint" @slotchange=${this.#onSlotChange}>${this.hint}</slot>
      </div>
      ${error ? html`<div id="error" part="error" class="error">${error}</div>` : nothing}
    `;
  }
}
