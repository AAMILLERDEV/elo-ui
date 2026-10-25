/** Registers a custom element unless the tag is already taken, so double imports don't throw. */
export function defineElement(tag: string, ctor: CustomElementConstructor): void {
  const existing = customElements.get(tag);
  if (existing === undefined) {
    customElements.define(tag, ctor);
  } else if (existing !== ctor) {
    console.warn(`[elo-ui] <${tag}> is already defined by another class; skipping.`);
  }
}
