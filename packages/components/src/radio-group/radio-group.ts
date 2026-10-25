import { css, html, type PropertyValues, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  RovingTabindexController,
  defineElement,
  hostStyles,
  visuallyHiddenStyles,
} from '@elo-ui/core';
import { EloRadio } from '../radio/radio.js';
import { ValueControl } from '../shared/value-control.js';
import { fieldStyles } from '../shared/form-control.styles.js';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

/**
 * A set of `<elo-radio>` options where one can be selected. Arrow keys move and select.
 *
 * @tag elo-radio-group
 *
 * @slot - `<elo-radio>` elements.
 * @slot label - Rich label content, instead of the `label` attribute.
 * @slot hint - Rich hint content, instead of the `hint` attribute.
 *
 * @csspart label - The group label.
 * @csspart group - The element wrapping the options.
 * @csspart hint - The hint text.
 * @csspart error - The error text.
 *
 * @fires input - When the user selects an option.
 * @fires change - When the user selects an option.
 */
export class EloRadioGroup extends ValueControl {
  static override styles = [
    hostStyles,
    visuallyHiddenStyles,
    fieldStyles,
    css`
      .options {
        display: flex;
        flex-direction: column;
        gap: var(--elo-space-2);
        padding-block: var(--elo-space-1);
      }

      :host([orientation='horizontal']) .options {
        flex-flow: row wrap;
        gap: var(--elo-space-2) var(--elo-space-4);
      }
    `,
  ];

  /** Layout direction of the options. Arrow keys work in both directions either way. */
  @property({ reflect: true }) accessor orientation: RadioGroupOrientation = 'vertical';

  @query('input[type="radio"]') private accessor proxy: HTMLInputElement | null = null;

  #syncing = false;

  readonly #roving = new RovingTabindexController(this, {
    items: () => (this.isDisabled ? [] : this.radios),
    onActiveChange: (radio) => {
      if (!this.#syncing) this.#select(radio as EloRadio);
    },
  });

  constructor() {
    super();
    this.addEventListener('click', this.#onClick);
    this.addEventListener('keydown', this.#onKeyDown);
  }

  /** The `<elo-radio>` options, in order. */
  get radios(): EloRadio[] {
    return [...this.querySelectorAll<EloRadio>('elo-radio')];
  }

  protected get validationTarget(): HTMLInputElement | null {
    return this.proxy;
  }

  protected override get validationAnchor(): HTMLElement | null {
    return this.radios.find((radio) => !radio.disabled) ?? null;
  }

  protected override updated(changed: PropertyValues<this>): void {
    this.#syncRadios();
    super.updated(changed);
  }

  #syncRadios(): void {
    const disabled = this.isDisabled;
    const radios = this.radios;
    for (const radio of radios) {
      radio.checked = radio.value === this.value;
      radio.toggleAttribute('data-group-disabled', disabled);
      if (disabled) radio.tabIndex = -1;
    }
    const checked = radios.find((radio) => radio.checked && !radio.disabled);
    this.#syncing = true;
    if (checked) this.#roving.setActiveItem(checked);
    else this.#roving.sync();
    this.#syncing = false;
  }

  #select(radio: EloRadio): void {
    if (this.isDisabled || radio.disabled || radio.value === this.value) return;
    this.setUserValue(radio.value);
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #radioFromEvent(event: Event): EloRadio | undefined {
    return event.composedPath().find((node): node is EloRadio => node instanceof EloRadio);
  }

  #onClick = (event: MouseEvent) => {
    const radio = this.#radioFromEvent(event);
    if (radio) {
      radio.focus();
      this.#select(radio);
    }
  };

  #onKeyDown = (event: KeyboardEvent) => {
    const radio = this.#radioFromEvent(event);
    if (radio && event.key === ' ') {
      event.preventDefault();
      this.#select(radio);
    }
  };

  override render(): TemplateResult {
    const error = this.visibleError;
    return html`<div class="field">
      <div id="label" part="label" class=${this.hideLabel ? 'label visually-hidden' : 'label'}>
        ${this.renderLabelContent()}
      </div>
      <div
        role="radiogroup"
        part="group"
        class="options"
        aria-labelledby="label"
        aria-describedby=${ifDefined(this.describedBy)}
        aria-required=${this.required ? 'true' : 'false'}
        aria-invalid=${error ? 'true' : 'false'}
        aria-disabled=${this.isDisabled ? 'true' : 'false'}
      >
        <slot @slotchange=${() => this.#syncRadios()}></slot>
      </div>
      <!-- Hidden proxy for native required validation; named because unnamed radios aren't validated. -->
      <input
        type="radio"
        name="proxy"
        class="visually-hidden"
        tabindex="-1"
        aria-hidden="true"
        .checked=${Boolean(this.value)}
        ?required=${this.required}
      />
      ${this.renderHelpText()}
    </div>`;
  }
}

defineElement('elo-radio-group', EloRadioGroup);

declare global {
  interface HTMLElementTagNameMap {
    'elo-radio-group': EloRadioGroup;
  }
}
