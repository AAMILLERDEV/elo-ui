// Vue renders custom elements natively, so it only needs template types.
export function generateVue(elements) {
  const imports = elements
    .map((el) => `import type { ${el.className} } from '${el.importPath}';`)
    .join('\n');

  const entries = elements
    .map((el) => {
      const props = el.props.map((p) => `'${p.name}'`).join(' | ') || 'never';
      const events = el.events
        .map(
          (e) =>
            `on${e.propName[0].toUpperCase()}${e.propName.slice(1)}?: (event: ${e.type}) => void`,
        )
        .join('; ');
      return `    '${el.tagName}': DefineComponent<Partial<Pick<${el.className}, ${props}>>${events ? ` & { ${events} }` : ''}>;`;
    })
    .join('\n');

  return {
    'components.d.ts': `import type { DefineComponent } from 'vue';
${imports}

declare module 'vue' {
  interface GlobalComponents {
${entries}
  }
}

export {};
`,
    'tags.ts': `/** Every custom element tag Elo UI defines. */
export const eloTags = [${elements.map((el) => `'${el.tagName}'`).join(', ')}] as const;
`,
  };
}
