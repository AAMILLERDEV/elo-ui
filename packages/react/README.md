# @elo-ui/react

React wrappers for [Elo UI](https://github.com/AAMILLERDEV/elo-ui) components, with typed props and events. Supports React 18 and 19.

```sh
npm install @elo-ui/core @elo-ui/react
```

```tsx
import '@elo-ui/core/theme.css';
import { EloButton } from '@elo-ui/react';

export function SaveButton({ saving }: { saving: boolean }) {
  return (
    <EloButton variant="primary" type="submit" loading={saving}>
      Save changes
    </EloButton>
  );
}
```

Wrappers are client components (`'use client'`), so they work in the Next.js App Router. Refs point to the underlying custom element.

## License

MIT
