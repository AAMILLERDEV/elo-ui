// DOM helpers that follow the flat tree (shadow roots and slots).

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'iframe',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/** The focused element, descending into open shadow roots. */
export function getDeepActiveElement(root: Document | ShadowRoot = document): Element | null {
  let active = root.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/** The node's parent in the flat tree: its assigned slot, its parent, or its shadow host. */
export function getComposedParent(node: Node): Node | null {
  if (node instanceof Element || node instanceof Text) {
    if (node.assignedSlot) return node.assignedSlot;
  }
  if (node.parentNode) return node.parentNode;
  return node instanceof ShadowRoot ? node.host : null;
}

/** Whether `node` is `ancestor` or inside it in the flat tree. */
export function composedContains(ancestor: Node, node: Node | null): boolean {
  for (let current = node; current; current = getComposedParent(current)) {
    if (current === ancestor) return true;
  }
  return false;
}

function isInert(el: Element): boolean {
  for (let node: Node | null = el; node; node = getComposedParent(node)) {
    if (node instanceof HTMLElement && node.inert) return true;
  }
  return false;
}

/** Whether `el` is in the sequential (Tab) focus order. */
export function isTabbable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement) || !el.matches(FOCUSABLE) || el.tabIndex < 0) return false;
  // :disabled also covers disabled fieldsets and form-associated elements.
  if (el.matches(':disabled')) return false;
  if (!el.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true })) return false;
  return !isInert(el);
}

function composedChildren(node: Node): Element[] {
  if (node instanceof HTMLSlotElement) return node.assignedElements({ flatten: true });
  if (node instanceof Element && node.shadowRoot) return [...node.shadowRoot.children];
  return node instanceof Element || node instanceof DocumentFragment || node instanceof Document
    ? [...node.children]
    : [];
}

/** Tabbable elements in `root` in flat-tree order, including shadow and slotted content. */
export function getTabbableElements(root: Element | ShadowRoot | Document): HTMLElement[] {
  const result: HTMLElement[] = [];
  const walk = (node: Node) => {
    for (const child of composedChildren(node)) {
      if (isTabbable(child)) result.push(child);
      walk(child);
    }
  };
  walk(root);
  return result;
}
