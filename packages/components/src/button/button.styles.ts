import { css } from 'lit';

export const buttonStyles = css`
  :host {
    display: inline-block;
    vertical-align: middle;

    --_height: var(--elo-control-height-md);
    --_padding-x: var(--elo-control-padding-x-md);
    --_font-size: var(--elo-font-size-md);

    --_bg: var(--elo-color-surface);
    --_bg-hover: var(--elo-color-surface-hover);
    --_bg-active: var(--elo-color-surface-active);
    --_fg: var(--elo-color-fg);
    --_border: var(--elo-color-border-strong);
  }

  /* Sizes */
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

  /* Variants (secondary is the default above) */
  :host([variant='primary']) {
    --_bg: var(--elo-color-accent);
    --_bg-hover: var(--elo-color-accent-hover);
    --_bg-active: var(--elo-color-accent-active);
    --_fg: var(--elo-color-accent-fg);
    --_border: transparent;
  }

  :host([variant='danger']) {
    --_bg: var(--elo-color-danger);
    --_bg-hover: var(--elo-color-danger-hover);
    --_bg-active: var(--elo-color-danger-active);
    --_fg: var(--elo-color-danger-fg);
    --_border: transparent;
  }

  :host([variant='ghost']) {
    --_bg: transparent;
    --_bg-hover: var(--elo-color-surface-hover);
    --_bg-active: var(--elo-color-surface-active);
    --_fg: var(--elo-color-fg);
    --_border: transparent;
  }

  .control {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--elo-control-gap);
    width: 100%;
    height: var(--_height);
    padding: 0 var(--_padding-x);
    margin: 0;
    font: inherit;
    font-size: var(--_font-size);
    font-weight: var(--elo-font-weight-medium);
    line-height: 1;
    color: var(--_fg);
    white-space: nowrap;
    text-decoration: none;
    background: var(--_bg);
    border: var(--elo-border-width) solid var(--_border);
    border-radius: var(--elo-radius-md);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color var(--elo-duration-fast) var(--elo-easing),
      border-color var(--elo-duration-fast) var(--elo-easing),
      color var(--elo-duration-fast) var(--elo-easing);
  }

  .control:hover:not(.is-disabled, .is-loading) {
    background: var(--_bg-hover);
  }

  .control:active:not(.is-disabled, .is-loading) {
    background: var(--_bg-active);
  }

  .control.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control.is-loading {
    cursor: progress;
  }

  .control.icon-only {
    width: var(--_height);
    padding: 0;
  }

  .start,
  .label,
  .end {
    display: inline-flex;
    align-items: center;
  }

  [hidden] {
    display: none !important;
  }

  ::slotted(svg) {
    flex-shrink: 0;
    width: 1.125em;
    height: 1.125em;
  }

  /* Loading: hide content with opacity so width and accessible name are preserved. */
  .is-loading > :not(.spinner) {
    opacity: 0;
  }

  .spinner {
    position: absolute;
    inset: 0;
    width: 1em;
    height: 1em;
    margin: auto;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: var(--elo-radius-full);
    animation: elo-spin 700ms linear infinite;
  }

  @keyframes elo-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .control {
      transition: none;
    }

    .spinner {
      animation-duration: 2s;
    }
  }

  @media (forced-colors: active) {
    .control {
      border-color: ButtonText;
    }

    .control.is-disabled {
      color: GrayText;
      border-color: GrayText;
      opacity: 1;
    }
  }
`;
