import { autoUpdate, computePosition, flip, offset, shift, type Placement } from '@floating-ui/dom';
import { css } from 'lit';

export type { Placement };

/** Keeps `floating` next to `anchor`, flipping and shifting to stay in view. Returns a cleanup. */
export function anchorTo(
  anchor: Element,
  floating: HTMLElement,
  placement: Placement,
  distance = 8,
): () => void {
  return autoUpdate(anchor, floating, async () => {
    const position = await computePosition(anchor, floating, {
      strategy: 'fixed',
      placement,
      middleware: [offset(distance), flip(), shift({ padding: 8 })],
    });
    floating.style.left = `${position.x}px`;
    floating.style.top = `${position.y}px`;
    floating.dataset.placement = position.placement;
  });
}

/** Resets the popover UA styles so Floating UI controls placement. */
export const floatingStyles = css`
  [popover] {
    position: fixed;
    inset: auto;
    margin: 0;
    padding: 0;
    overflow: visible;
    color: var(--elo-color-fg);
    font-family: var(--elo-font-family);
    font-size: var(--elo-font-size-md);
    line-height: var(--elo-line-height);
    background: none;
    border: 0;
  }

  .panel {
    min-width: 10rem;
    max-width: min(24rem, calc(100vw - 16px));
    background: var(--elo-color-surface);
    border: var(--elo-border-width) solid var(--elo-color-border);
    border-radius: var(--elo-radius-lg);
    box-shadow: var(--elo-shadow-lg);
  }

  @media (forced-colors: active) {
    .panel {
      border-color: CanvasText;
    }
  }
`;
