import { afterEach } from 'vitest';

const containers: HTMLElement[] = [];

afterEach(() => {
  containers.splice(0).forEach((el) => el.remove());
});

/** Renders markup, waits for elements to update, and returns the container. */
export async function mount(markup: string): Promise<HTMLElement> {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.append(container);
  containers.push(container);
  await Promise.all(
    [...container.querySelectorAll('*')].map(
      (el) => (el as Partial<{ updateComplete: Promise<unknown> }>).updateComplete,
    ),
  );
  return container;
}

/** Defines a test element once; returns the tag. */
export function defineOnce(tag: string, ctor: CustomElementConstructor): string {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
  return tag;
}

/** An element with an open shadow root containing `html`. */
export function shadowHost(tag: string, html: string, init: Partial<ShadowRootInit> = {}): string {
  return defineOnce(
    tag,
    class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open', ...init }).innerHTML = html;
      }
    },
  );
}
