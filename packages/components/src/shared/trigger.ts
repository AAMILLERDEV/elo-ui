// Trigger ARIA: Elo elements take properties (ARIA on a host doesn't reach its inner button).
interface TriggerState {
  expanded?: boolean;
  haspopup?: 'menu' | 'dialog' | 'true';
  description?: string | undefined;
}

type EloTrigger = HTMLElement & Partial<Record<keyof TriggerState, unknown>>;

let descriptionId = 0;
const descriptions = new WeakMap<HTMLElement, HTMLElement>();

/** The first element assigned to `slot`, flattening nested slots. */
export function firstAssigned(slot: HTMLSlotElement | null | undefined): HTMLElement | undefined {
  return slot?.assignedElements({ flatten: true })[0] as HTMLElement | undefined;
}

/** Sets expanded, popup, and description state on a trigger, Elo element or native. */
export function setTriggerState(trigger: HTMLElement, state: TriggerState): void {
  const el = trigger as EloTrigger;
  const isElo = trigger.localName.startsWith('elo-');

  if (state.expanded !== undefined) {
    if (isElo) el.expanded = state.expanded;
    else trigger.setAttribute('aria-expanded', String(state.expanded));
  }
  if (state.haspopup !== undefined) {
    if (isElo) el.haspopup = state.haspopup;
    else trigger.setAttribute('aria-haspopup', state.haspopup);
  }
  if ('description' in state) {
    if (isElo) el.description = state.description;
    else setNativeDescription(trigger, state.description);
  }
}

// Native triggers get a hidden light-DOM sibling referenced by aria-describedby.
function setNativeDescription(trigger: HTMLElement, text: string | undefined): void {
  let node = descriptions.get(trigger);
  if (!text) {
    node?.remove();
    descriptions.delete(trigger);
    trigger.removeAttribute('aria-describedby');
    return;
  }
  if (!node) {
    node = document.createElement('span');
    node.id = `elo-description-${++descriptionId}`;
    node.hidden = true;
    trigger.after(node);
    descriptions.set(trigger, node);
  }
  node.textContent = text;
  trigger.setAttribute('aria-describedby', node.id);
}
