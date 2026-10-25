import '@elo-ui/core/theme.css';
import { afterEach } from 'vitest';

const fixtures: HTMLElement[] = [];

afterEach(() => {
  fixtures.splice(0).forEach((el) => el.remove());
});

/** Renders HTML into a fresh container, waits for custom elements to update, and returns the first child. */
export async function fixture<T extends Element>(markup: string): Promise<T> {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.append(container);
  fixtures.push(container);

  const elements = [container, ...container.querySelectorAll('*')];
  await Promise.all(
    elements.map((el) => (el as Partial<{ updateComplete: Promise<unknown> }>).updateComplete),
  );
  return container.firstElementChild as T;
}
