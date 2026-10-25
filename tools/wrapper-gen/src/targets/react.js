export function generateReact(elements) {
  const files = {};

  for (const el of elements) {
    const events = el.events
      .map(
        (e) =>
          `    on${e.propName[0].toUpperCase()}${e.propName.slice(1)}: '${e.name}' as EventName<${e.type}>,`,
      )
      .join('\n');

    files[`${el.fileName}.ts`] = `'use client';
import * as React from 'react';
import { createComponent${events ? ', type EventName' : ''} } from '@lit/react';
import { ${el.className} as ${el.className}Element } from '${el.importPath}';

${el.summary ? `/** ${el.summary} */\n` : ''}export const ${el.className} = createComponent({
  tagName: '${el.tagName}',
  elementClass: ${el.className}Element,
  react: React,
  displayName: '${el.className}',
  events: {${
    events
      ? `
${events}
  `
      : ''
  }},
});
`;
  }

  files['index.ts'] =
    elements.map((el) => `export { ${el.className} } from './${el.fileName}.js';`).join('\n') +
    '\n';

  return files;
}
