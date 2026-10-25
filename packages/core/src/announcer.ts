export type Politeness = 'polite' | 'assertive';

export interface AnnounceOptions {
  /** `polite` waits for the screen reader to finish; `assertive` interrupts. Defaults to `polite`. */
  politeness?: Politeness;
}

/**
 * Delay between clearing and setting a region's text. Screen readers ignore a change to the same
 * text, and some miss text set in the same frame a region is created.
 */
const ANNOUNCE_DELAY_MS = 100;

const HIDDEN_STYLE =
  'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;' +
  'clip-path:inset(50%);white-space:nowrap;border:0;';

const regions = new Map<Politeness, HTMLElement>();
const pending = new Map<Politeness, { timer: ReturnType<typeof setTimeout>; done: () => void }>();

function getRegion(politeness: Politeness): HTMLElement {
  let region = regions.get(politeness);
  if (!region?.isConnected) {
    region = document.createElement('div');
    region.dataset.eloAnnouncer = politeness;
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.style.cssText = HIDDEN_STYLE;
    document.body.append(region);
    regions.set(politeness, region);
  }
  return region;
}

/**
 * Announces `message` to screen readers through a shared, visually hidden live region.
 * Repeating the same message announces it again. A newer message on the same politeness
 * replaces one that hasn't been announced yet.
 *
 * Resolves once the message is in the live region.
 *
 * Note: content outside an open modal `<dialog>` is inert, so announcements made while one is
 * open may not be read. Components that open modals should announce from inside them.
 */
export function announce(
  message: string,
  { politeness = 'polite' }: AnnounceOptions = {},
): Promise<void> {
  const region = getRegion(politeness);
  const previous = pending.get(politeness);
  if (previous) {
    clearTimeout(previous.timer);
    previous.done();
  }
  region.textContent = '';

  return new Promise((resolve) => {
    const done = () => {
      pending.delete(politeness);
      resolve();
    };
    const timer = setTimeout(() => {
      region.textContent = message;
      done();
    }, ANNOUNCE_DELAY_MS);
    pending.set(politeness, { timer, done });
  });
}

/** Clears both live regions and cancels pending announcements. */
export function clearAnnouncements(): void {
  for (const [politeness, { timer, done }] of pending) {
    clearTimeout(timer);
    done();
    regions.get(politeness)?.replaceChildren();
  }
  for (const region of regions.values()) region.replaceChildren();
}
