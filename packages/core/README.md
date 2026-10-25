# @elo-ui/core

Design tokens, theme, and accessibility utilities for [Elo UI](https://github.com/AAMILLERDEV/elo-ui).

```sh
npm install @elo-ui/core
```

## Theme

Load the theme once in your app. It defines every `--elo-*` design token.

```js
import '@elo-ui/core/theme.css';
```

- Follows `prefers-color-scheme`; set `data-elo-theme="light"` or `"dark"` on any element to force a theme for that subtree.
- Set `data-elo-density="compact"` on any element for tighter controls.
- Re-brand by overriding semantic tokens (`--elo-color-accent`, `--elo-color-surface`, …), not primitives.

## Utilities

Shared building blocks for accessible components. They're Shadow DOM-aware: they follow open shadow roots and slot assignments.

| Export                                                                  | Purpose                                                        |
| ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| `FocusTrapController`                                                   | Keep Tab focus inside a non-modal overlay; nested traps stack. |
| `RovingTabindexController`                                              | Arrow-key navigation within a group that is one Tab stop.      |
| `TypeaheadController`                                                   | Jump to items by typing their first letters.                   |
| `announce()` / `clearAnnouncements()`                                   | Screen reader announcements through shared live regions.       |
| `getTabbableElements()`, `getDeepActiveElement()`, `composedContains()` | Composed-tree DOM helpers.                                     |
| `defineElement()`                                                       | Register a custom element without throwing on re-registration. |

## License

MIT
