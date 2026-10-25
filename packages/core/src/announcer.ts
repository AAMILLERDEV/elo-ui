export type Politeness = 'polite' | 'assertive';

export interface AnnounceOptions {
  /** `polite` (default) waits for the screen reader; `assertive` interrupts. */
  politeness?: Politeness;
}

// Clear-then-set delay, so screen readers re-read repeated messages.
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

/** Announces via a shared live region (unread while a modal is open); resolves once set. */
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
