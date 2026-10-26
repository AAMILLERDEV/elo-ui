import { css } from 'lit';

/** Maps `variant` to soft background, border, and text colors via --_bg, --_border, --_fg. */
export const variantStyles = css`
  :host {
    --_bg: var(--elo-color-neutral-soft-bg);
    --_border: var(--elo-color-neutral-soft-border);
    --_fg: var(--elo-color-neutral-soft-fg);
  }

  :host([variant='info']) {
    --_bg: var(--elo-color-info-soft-bg);
    --_border: var(--elo-color-info-soft-border);
    --_fg: var(--elo-color-info-soft-fg);
  }

  :host([variant='success']) {
    --_bg: var(--elo-color-success-soft-bg);
    --_border: var(--elo-color-success-soft-border);
    --_fg: var(--elo-color-success-soft-fg);
  }

  :host([variant='warning']) {
    --_bg: var(--elo-color-warning-soft-bg);
    --_border: var(--elo-color-warning-soft-border);
    --_fg: var(--elo-color-warning-soft-fg);
  }

  :host([variant='danger']) {
    --_bg: var(--elo-color-danger-soft-bg);
    --_border: var(--elo-color-danger-soft-border);
    --_fg: var(--elo-color-danger-soft-fg);
  }

  .icon {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
  }

  @media (forced-colors: active) {
    :host {
      --_border: CanvasText;
    }
  }
`;
