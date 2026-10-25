/**
 * @typedef {object} ElementProp
 * @property {string} name
 * @property {boolean} isBoolean
 * @property {string} [description]
 *
 * @typedef {object} ElementEvent
 * @property {string} name        DOM event name, e.g. "elo-change"
 * @property {string} propName    camelCase name, e.g. "eloChange"
 * @property {string} type        event type text, e.g. "CustomEvent<{ value: string }>"
 * @property {string} [description]
 *
 * @typedef {object} ElementInfo
 * @property {string} tagName       e.g. "elo-button"
 * @property {string} className     e.g. "EloButton"
 * @property {string} importPath    e.g. "@elo-ui/components/button"
 * @property {string} fileName      e.g. "button"
 * @property {string} [summary]
 * @property {ElementProp[]} props
 * @property {ElementEvent[]} events
 */

const camelCase = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/**
 * Extracts the elements the wrappers need from a Custom Elements Manifest.
 * Convention: each component lives at src/<name>/<name>.ts and is exported as "./<name>".
 *
 * @returns {ElementInfo[]}
 */
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

      elements.push({
        tagName: decl.tagName,
        className: decl.name,
        importPath: `@elo-ui/components/${match[1]}`,
        fileName: match[1],
        summary: decl.summary ?? decl.description?.split('\n')[0],
        props,
        events,
      });
    }
  }

  return elements.sort((a, b) => a.tagName.localeCompare(b.tagName));
}
