// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- type-only augmentation
/// <reference path="./generated/components.d.ts" />
import { eloTags } from './generated/tags.js';

export { eloTags };

/** Tells Vue's template compiler that `elo-*` tags are custom elements. */
export function isEloElement(tag: string): boolean {
  return tag.startsWith('elo-');
}

/** Ready-made compiler options for `@vitejs/plugin-vue` or `app.config.compilerOptions`. */
export const eloCompilerOptions = { isCustomElement: isEloElement };
