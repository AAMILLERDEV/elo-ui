// Standalone directives: typed inputs set element properties; custom events become outputs.
export function generateAngular(elements) {
  const files = {};

  for (const el of elements) {
    const needsBoolean = el.props.some((p) => p.isBoolean);
    // Native events (input, change) already bind with (event); a same-named output would fire twice.
    const events = el.events.filter((e) => e.name.includes('-'));
    const hasEvents = events.length > 0;
    const coreImports = [
      'Directive',
      'ElementRef',
      'Input',
      'inject',
      ...(needsBoolean ? ['booleanAttribute'] : []),
      ...(hasEvents ? ['EventEmitter', 'HostListener', 'Output'] : []),
    ].sort();

    const inputs = el.props
      .map((p) => {
        const doc = p.description ? `  /** ${p.description} */\n` : '';
        const decorator = p.isBoolean ? '@Input({ transform: booleanAttribute })' : '@Input()';
        return `${doc}  ${decorator}
  set ${p.name}(value: ${el.className}Element['${p.name}']) {
    this.element.${p.name} = value;
  }
  get ${p.name}(): ${el.className}Element['${p.name}'] {
    return this.element.${p.name};
  }`;
      })
      .join('\n\n');

    const outputs = events
      .map((e) => {
        const doc = e.description ? `  /** ${e.description} */\n` : '';
        const handler = `on${e.propName[0].toUpperCase()}${e.propName.slice(1)}`;
        return `${doc}  @Output() readonly ${e.propName} = new EventEmitter<${e.type}>();

  @HostListener('${e.name}', ['$event'])
  protected ${handler}(event: ${e.type}): void {
    this.${e.propName}.emit(event);
  }`;
      })
      .join('\n\n');

    files[`${el.fileName}.ts`] = `import { ${coreImports.join(', ')} } from '@angular/core';
import { ${el.className} as ${el.className}Element } from '${el.importPath}';

${el.summary ? `/** ${el.summary} */\n` : ''}@Directive({
  selector: '${el.tagName}',
  standalone: true,
})
export class ${el.className} {
  /** The underlying \`<${el.tagName}>\` element. */
  readonly element: ${el.className}Element = inject(ElementRef).nativeElement;

${[inputs, outputs].filter(Boolean).join('\n\n')}
}
`;
  }

  files['index.ts'] = `${elements
    .map((el) => `import { ${el.className} } from './${el.fileName}';`)
    .join('\n')}

${elements.map((el) => `export { ${el.className} } from './${el.fileName}';`).join('\n')}

/** All Elo UI directives, for a standalone component's \`imports\`. */
export const ELO_UI_DIRECTIVES = [${elements.map((el) => el.className).join(', ')}] as const;
`;

  return files;
}
