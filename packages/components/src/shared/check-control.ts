import { css, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { FormControl } from './form-control.js';

/** Base for on/off controls backed by a native checkbox: checkbox and switch. */
export abstract class CheckControl extends FormControl {
  /** Initial state, restored on form reset. Set with the `checked` attribute. */
  @property({ type: Boolean, attribute: 'checked' }) accessor defaultChecked = false;

  /** Value submitted with the form when checked. */
  @property() accessor value = 'on';

  @query('input') protected accessor input: HTMLInputElement | null = null;

  #checked = false;
  // Like native checkboxes: once set by the user or by code, the default no longer applies.
  #dirty = false;

  /** Whether the control is on. */
  @property({ type: Boolean, attribute: false })
  set checked(checked: boolean) {
    this.#dirty = true;
    this.#checked = checked;
  }
  get checked(): boolean {
    return this.#checked;
  }

  protected get validationTarget(): HTMLInputElement | null {
    return this.input;
  }

  #applyDefault(): void {
    const old = this.#checked;
    this.#checked = this.defaultChecked;
    this.requestUpdate('checked', old);
  }

  protected resetValue(): void {
    this.#dirty = false;
    this.#applyDefault();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('defaultChecked') && !this.#dirty) this.#applyDefault();
    super.willUpdate(changed);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('checked') || changed.has('value')) {
      this.internals.setFormValue(this.checked ? this.value : null);
    }
    super.updated(changed);
  }

  /** Toggles the control, as a click would, without firing events. */
  toggle(): void {
    this.checked = !this.checked;
  }

  // `input` fires before `change`, so sync `checked` here for input listeners.
  protected onNativeInput = (event: Event): void => {
    this.checked = (event.target as HTMLInputElement).checked;
  };

  protected onNativeChange = (): void => {
    this.dispatchEvent(new Event('change', { bubbles: true }));
  };
}

/** Row layout for a control with its label beside it. */
export const choiceStyles = css`
  .choice {
    display: inline-flex;
    gap: var(--elo-space-2);
    align-items: flex-start;
    cursor: pointer;
  }

  .choice.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .indicator {
    position: relative;
    display: inline-grid;
    flex-shrink: 0;
    place-items: center;
    margin-block: calc((1lh - 1rem) / 2);
  }

  input {
    appearance: none;
    margin: 0;
    cursor: inherit;
  }

  input:focus-visible {
    outline: var(--elo-focus-ring-width) solid var(--elo-color-focus-ring);
    outline-offset: var(--elo-focus-ring-offset);
  }

  .help {
    padding-inline-start: calc(1rem + var(--elo-space-2));
  }
`;
