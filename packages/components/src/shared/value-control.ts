import type { PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { FormControl } from './form-control.js';

/** Base for controls with a string value: input, textarea, select, and radio group. */
export abstract class ValueControl extends FormControl {
  /** Initial value, restored on form reset. Set with the `value` attribute. */
  @property({ attribute: 'value' }) accessor defaultValue = '';

  #value = '';
  // Like native inputs: once set by the user or by code, the default no longer applies.
  #dirty = false;

  /** Current value. */
  @property({ attribute: false })
  set value(value: string) {
    this.#dirty = true;
    this.#value = value;
  }
  get value(): string {
    return this.#value;
  }

  #applyDefault(): void {
    const old = this.#value;
    this.#value = this.defaultValue;
    this.requestUpdate('value', old);
  }

  protected resetValue(): void {
    this.#dirty = false;
    this.#applyDefault();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('defaultValue') && !this.#dirty) this.#applyDefault();
    super.willUpdate(changed);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('value')) this.internals.setFormValue(this.value);
    super.updated(changed);
  }

  /** Sets the value as a user change. */
  protected setUserValue(value: string): void {
    this.value = value;
  }

  protected onNativeInput = (event: Event): void => {
    this.setUserValue((event.target as HTMLInputElement).value);
  };

  // Native `change` isn't composed, so re-dispatch it from the host.
  protected onNativeChange = (): void => {
    this.dispatchEvent(new Event('change', { bubbles: true }));
  };
}
