import { css } from 'lit';

/** Layout for label, hint, and error around any control. */
export const fieldStyles = css`
  :host {
    display: block;
    color: var(--elo-color-fg);
    font-size: var(--elo-font-size-md);
    line-height: var(--elo-line-height);

    --_height: var(--elo-control-height-md);
    --_padding-x: var(--elo-control-padding-x-md);
    --_font-size: var(--elo-font-size-md);
  }

  :host([size='sm']) {
    --_height: var(--elo-control-height-sm);
    --_padding-x: var(--elo-control-padding-x-sm);
    --_font-size: var(--elo-font-size-sm);
  }

  :host([size='lg']) {
    --_height: var(--elo-control-height-lg);
    --_padding-x: var(--elo-control-padding-x-lg);
    --_font-size: var(--elo-font-size-lg);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--elo-space-1);
  }

  .label {
    font-weight: var(--elo-font-weight-medium);
  }

  .required {
    margin-inline-start: 0.125em;
    color: var(--elo-color-danger-text);
  }

  .hint,
  .error {
    font-size: var(--elo-font-size-sm);
  }

  .hint {
    color: var(--elo-color-fg-muted);
  }

  .error {
    color: var(--elo-color-danger-text);
  }

  [hidden] {
    display: none !important;
  }
`;

/** The bordered box shared by text inputs, textareas, and selects. */
export const textControlStyles = css`
  .control {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--elo-control-gap);
    min-height: var(--_height);
    padding: 0 var(--_padding-x);
    font-size: var(--_font-size);
    color: var(--elo-color-fg);
    background: var(--elo-color-surface);
    border: var(--elo-border-width) solid var(--elo-color-border-control);
    border-radius: var(--elo-radius-md);
    transition: border-color var(--elo-duration-fast) var(--elo-easing);
  }

  .control:focus-within {
    outline: var(--elo-focus-ring-width) solid var(--elo-color-focus-ring);
    outline-offset: 1px;
  }

  .control.invalid {
    border-color: var(--elo-color-danger);
  }

  .control.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  input,
  textarea,
  select {
    flex: 1;
    min-width: 0;
    margin: 0;
    padding: 0;
    font: inherit;
    color: inherit;
    background: transparent;
    border: 0;
    outline: 0;
  }

  input,
  select {
    height: calc(var(--_height) - 2 * var(--elo-border-width));
  }

  :disabled {
    cursor: not-allowed;
  }

  ::placeholder {
    color: var(--elo-color-fg-muted);
    opacity: 1;
  }

  ::slotted(svg) {
    flex-shrink: 0;
    width: 1.125em;
    height: 1.125em;
    color: var(--elo-color-fg-muted);
  }

  @media (forced-colors: active) {
    .control {
      border-color: FieldText;
    }

    .control:focus-within {
      outline-color: Highlight;
    }
  }
`;
