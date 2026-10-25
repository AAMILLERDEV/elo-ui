# Elo UI

Accessible, framework-agnostic web components for dashboards and admin interfaces.

- **Web standards first.** Lit-based custom elements with Shadow DOM, form-associated where it matters.
- **Accessible by default.** WCAG 2.2 AA, full keyboard support, axe-tested in Chromium, Firefox, and WebKit.
- **Any framework.** Typed wrappers for React (18+), Vue (3.3+), and Angular (20+), generated from one manifest.
- **Themeable.** Design tokens as CSS custom properties, automatic dark mode, and a compact density for data-heavy screens.

## Packages

| Package              | Description                                  |
| -------------------- | -------------------------------------------- |
| `@elo-ui/core`       | Design tokens, `theme.css`, shared utilities |
| `@elo-ui/components` | The web components                           |
| `@elo-ui/react`      | React wrappers (`@lit/react`)                |
| `@elo-ui/vue`        | Vue template types and compiler options      |
| `@elo-ui/angular`    | Angular standalone directives                |

## Quick start

```sh
npm install @elo-ui/core @elo-ui/components
```

```js
import '@elo-ui/core/theme.css';
import '@elo-ui/components/button';
```

```html
<elo-button variant="primary">Save</elo-button>
```

## Development

Requires Node 24 (see `.nvmrc`) and pnpm (`corepack enable pnpm`).

```sh
pnpm install
pnpm exec playwright install chromium firefox webkit   # once, for browser tests
pnpm build        # all packages, in dependency order (Turborepo)
pnpm test         # browser tests in Chromium, Firefox, WebKit
pnpm typecheck
pnpm lint
pnpm lint:packages   # publint + Are The Types Wrong on the packed tarballs
pnpm --filter @elo-ui/docs dev   # docs site at http://localhost:4321
```

Run tests in one browser with `ELO_BROWSERS=chromium pnpm test`.

### Repository layout

```
packages/
  core/          tokens, theme.css, shared styles, a11y controllers (focus trap,
                 roving tabindex, type-ahead), live announcer, composed-tree DOM helpers
  components/    Lit components; build emits dist/ and custom-elements.json
  react/ vue/ angular/
                 wrappers generated from custom-elements.json into src/generated/
apps/
  docs/          Astro docs site; API tables are read from custom-elements.json
tools/
  wrapper-gen/   manifest → React/Vue/Angular code generator
  build-tools/   shared Vite plugin (standard decorators under Vite 8) and Vitest browser config
```

### Adding a component

1. Create `packages/components/src/<name>/<name>.ts` (class + `defineElement('elo-<name>', …)`),
   with JSDoc for slots, parts, and events. The manifest and wrappers are derived from it.
2. Add `"./<name>"` to `packages/components/package.json` `exports` and export the class from `src/index.ts`.
3. Write `<name>.test.ts` covering keyboard, forms (if relevant), and axe in light, dark, and compact.
4. Add a docs page in `apps/docs/src/pages/components/`.
5. Run `pnpm changeset` to describe the change.

### Notes

- **Standard decorators:** Vite 8's Oxc transformer only supports legacy decorators, so Vite-served
  code (tests) runs through `@elo-ui/build-tools/vite`. Library builds use `tsc` directly. A canary
  test fails once Oxc supports them, so the plugin can be removed.
- **Browser tests** use `browserTest()` from `@elo-ui/build-tools/vitest`. Give each package a
  unique `port` (core 63401, components 63402, react 63403, vue 63404, angular 63405): package
  tests run in parallel.
- **Shared versions** live in the pnpm `catalog` in `pnpm-workspace.yaml`; reference them as
  `"catalog:"`. Renovate (`renovate.json`) groups updates and holds TypeScript below 7, since
  typescript-eslint and Angular's compiler don't support it yet.
- **Dependency build scripts** are denied by default; see `allowBuilds` in `pnpm-workspace.yaml`.

## License

MIT
