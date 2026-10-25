# @elo-ui/vue

Vue 3 integration for [Elo UI](https://github.com/AAMILLERDEV/elo-ui): template type-checking for every `elo-*` element, plus compiler options.

```sh
npm install @elo-ui/core @elo-ui/components @elo-ui/vue
```

Tell Vue's compiler that `elo-*` tags are custom elements:

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue';
import { eloCompilerOptions } from '@elo-ui/vue';

export default { plugins: [vue({ template: { compilerOptions: eloCompilerOptions } })] };
```

Then use the components directly. Importing `@elo-ui/vue` anywhere enables typed props in templates:

```vue
<script setup lang="ts">
import '@elo-ui/core/theme.css';
import '@elo-ui/components/button';
</script>

<template>
  <elo-button variant="primary" :loading="saving">Save</elo-button>
</template>
```

## Forms

With `eloCompilerOptions`, `v-model` works on every form control. Checkboxes and switches bind `checked` (including arrays of values), like native checkboxes:

```vue
<elo-input label="Name" v-model="name" />
<elo-checkbox label="Subscribe" v-model="subscribe" />
```

## License

MIT
