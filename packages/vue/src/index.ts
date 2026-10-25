// GlobalComponents augmentation has no runtime module, so it must be a reference, not an import.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./generated/components.d.ts" />
import { eloTags } from './generated/tags.js';

export { eloTags };

/**
 * Tells Vue's template compiler that `elo-*` tags are custom elements.
 *
 * @example
 * // vite.config.ts
 * vue({ template: { compilerOptions: { isCustomElement: isEloElement } } })
 */
export function isEloElement(tag: string): boolean {
  return tag.startsWith('elo-');
}

/** Ready-made compiler options for `@vitejs/plugin-vue` or `app.config.compilerOptions`. */
export const eloCompilerOptions = { isCustomElement: isEloElement };
