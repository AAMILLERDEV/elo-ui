import { css } from 'lit';

/** Baseline host styles shared by every component. */
export const hostStyles = css`
  :host {
    box-sizing: border-box;
    font-family: var(--elo-font-family);
  }

  :host([hidden]) {
    display: none !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }
`;

/** Visible keyboard focus indicator. Apply to the focusable element inside the shadow root. */
export const focusRingStyles = css`
  .focus-ring:focus-visible {
    outline: var(--elo-focus-ring-width) solid var(--elo-color-focus-ring);
    outline-offset: var(--elo-focus-ring-offset);
  }
`;

/** Hides content visually while keeping it available to assistive technology. */
export const visuallyHiddenStyles = css`
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
