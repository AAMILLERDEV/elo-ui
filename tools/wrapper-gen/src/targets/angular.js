import { formKind } from '../manifest.js';

// Standalone directives: typed inputs set element properties; custom events become outputs.
export function generateAngular(elements) {
  const files = {};

  for (const el of elements) {
    const needsBoolean = el.props.some((p) => p.isBoolean);
    // Native events (input, change) already bind with (event); a same-named output would fire twice.
    const events = el.events.filter((e) => e.name.includes('-'));
    const kind = formKind(el);
    const coreImports = [
      'Directive',
      'ElementRef',
      'Input',
      'inject',
      ...(needsBoolean ? ['booleanAttribute'] : []),
      ...(events.length > 0 ? ['EventEmitter', 'Output'] : []),
      ...(events.length > 0 || kind ? ['HostListener'] : []),
      ...(kind ? ['forwardRef'] : []),
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

    const valueAccessor = kind ? renderValueAccessor(el, kind) : '';

    files[`${el.fileName}.ts`] = `import { ${coreImports.join(', ')} } from '@angular/core';
${kind ? "import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';\n" : ''}import { ${el.className} as ${el.className}Element } from '${el.importPath}';

${el.summary ? `/** ${el.summary} */\n` : ''}@Directive({
  selector: '${el.tagName}',
  standalone: true,${
    kind
      ? `
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ${el.className}), multi: true },
  ],`
      : ''
  }
})
export class ${el.className}${kind ? ' implements ControlValueAccessor' : ''} {
  /** The underlying \`<${el.tagName}>\` element. */
  readonly element: ${el.className}Element = inject(ElementRef).nativeElement;

${[inputs, outputs, valueAccessor].filter(Boolean).join('\n\n')}
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

// ControlValueAccessor, so ngModel, formControl, and formControlName work.
function renderValueAccessor(el, kind) {
  const type = `${el.className}Element['${kind}']`;
  const write =
    kind === 'checked'
      ? 'this.element.checked = Boolean(value);'
      : "this.element.value = value ?? '';";
  const event = kind === 'checked' ? 'change' : 'input';
  return `  private onChange: (value: ${type}) => void = () => {};
  private onTouched: () => void = () => {};

  /** @internal */
  writeValue(value: ${type} | null): void {
    ${write}
  }

  /** @internal */
  registerOnChange(fn: (value: ${type}) => void): void {
    this.onChange = fn;
  }

  /** @internal */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @internal */
  setDisabledState(disabled: boolean): void {
    this.element.disabled = disabled;
  }

  @HostListener('${event}')
  protected handleValueChange(): void {
    this.onChange(this.element.${kind});
  }

  @HostListener('focusout')
  protected handleBlur(): void {
    this.onTouched();
  }`;
}
