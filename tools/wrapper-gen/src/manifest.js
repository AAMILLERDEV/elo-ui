const camelCase = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

// DOM globals that event types may mention; anything else is imported from the component module.
const GLOBAL_TYPES = new Set([
  'Event',
  'CustomEvent',
  'MouseEvent',
  'KeyboardEvent',
  'FocusEvent',
  'InputEvent',
  'PointerEvent',
  'ToggleEvent',
  'HTMLElement',
  'Element',
]);

// One entry per component at src/<name>/<name>.ts, exported as "./<name>".
export function readElements(manifest) {
  const elements = [];

  for (const mod of manifest.modules) {
    for (const decl of mod.declarations ?? []) {
      if (!decl.customElement || !decl.tagName) continue;

      const match = /^src\/([^/]+)\/\1\.ts$/.exec(mod.path);
      if (!match) {
        throw new Error(
          `${decl.tagName}: expected module at src/<name>/<name>.ts, got ${mod.path}`,
        );
      }

      const props = (decl.members ?? [])
        .filter((m) => m.kind === 'field' && !m.static && !m.readonly && !m.privacy)
        .filter((m) => !m.name.startsWith('#') && !m.name.startsWith('_'))
        .map((m) => ({
          name: m.name,
          isBoolean: m.type?.text === 'boolean',
          description: m.description,
        }));

      const events = (decl.events ?? [])
        .filter((e) => e.name)
        .map((e) => ({
          name: e.name,
          propName: camelCase(e.name),
          type: e.type?.text ?? 'Event',
          description: e.description,
        }));

      const typeImports = [
        ...new Set(events.flatMap((e) => e.type.match(/\b[A-Z]\w*\b/g) ?? [])),
      ].filter((name) => !GLOBAL_TYPES.has(name));

      elements.push({
        tagName: decl.tagName,
        className: decl.name,
        importPath: `@elo-ui/components/${match[1]}`,
        fileName: match[1],
        summary: decl.summary ?? decl.description?.split('\n')[0],
        props,
        events,
        typeImports,
      });
    }
  }

  return elements.sort((a, b) => a.tagName.localeCompare(b.tagName));
}

// 'checked' for checkbox-like controls, 'value' for text-like ones, null for non-form elements.
export function formKind(el) {
  const props = new Set(el.props.map((p) => p.name));
  const events = new Set(el.events.map((e) => e.name));
  if (props.has('checked') && events.has('change')) return 'checked';
  if (props.has('value') && events.has('input')) return 'value';
  return null;
}
