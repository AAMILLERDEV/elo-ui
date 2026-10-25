import type { PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { FormControl } from './form-control.js';

/** Base for controls with a string value: input, textarea, and select. */
export abstract class ValueControl extends FormControl {
  /** Current value. */
  @property({ attribute: false }) accessor value = '';

  /** Initial value, restored on form reset. Set with the `value` attribute. */
  @property({ attribute: 'value' }) accessor defaultValue = '';

  #dirty = false;

  protected resetValue(): void {
    this.#dirty = false;
    this.value = this.defaultValue;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('defaultValue') && !this.#dirty) this.value = this.defaultValue;
    super.willUpdate(changed);
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('value')) this.internals.setFormValue(this.value);
    super.updated(changed);
  }

  /** Sets the value as a user change, so `defaultValue` updates no longer override it. */
  protected setUserValue(value: string): void {
    this.#dirty = true;
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
