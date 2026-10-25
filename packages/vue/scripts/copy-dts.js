// tsc doesn't emit hand-written .d.ts files, so copy the generated GlobalComponents types.
import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('dist/generated', { recursive: true });
copyFileSync('src/generated/components.d.ts', 'dist/generated/components.d.ts');
