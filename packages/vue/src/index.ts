// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- type-only augmentation
/// <reference path="./generated/components.d.ts" />
import { eloCheckedTags, eloTags } from './generated/tags.js';

export { eloCheckedTags, eloTags };

// Minimal shapes of Vue's template AST (NodeTypes.ELEMENT = 1, TEXT = 2, ATTRIBUTE = 6, DIRECTIVE = 7).
interface TemplateProp {
  type: number;
  name: string;
  loc: unknown;
}
interface TemplateNode {
  type: number;
  tag?: string;
  props?: TemplateProp[];
}

const checkedTags = new Set<string>(eloCheckedTags);

/** Tells Vue's template compiler that `elo-*` tags are custom elements. */
export function isEloElement(tag: string): boolean {
  return tag.startsWith('elo-');
}

/** Makes `v-model` bind `checked` on checkbox-like elements, as on a native checkbox. */
export function eloModelTransform(node: TemplateNode): void {
  if (node.type !== 1 || !node.tag || !checkedTags.has(node.tag) || !node.props) return;
  const model = node.props.find((p) => p.type === 7 && p.name === 'model');
  if (!model || node.props.some((p) => p.type === 6 && p.name === 'type')) return;
  // Vue picks its checkbox model for custom elements with a static type="checkbox".
  node.props.push({
    type: 6,
    name: 'type',
    nameLoc: model.loc,
    value: { type: 2, content: 'checkbox', loc: model.loc },
    loc: model.loc,
  } as TemplateProp);
}

/** Ready-made compiler options for `@vitejs/plugin-vue` or `app.config.compilerOptions`. */
export const eloCompilerOptions = {
  isCustomElement: isEloElement,
  nodeTransforms: [eloModelTransform],
};
