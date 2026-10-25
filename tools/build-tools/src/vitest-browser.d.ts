import type { ViteUserConfig } from 'vitest/config';

/** Shared Vitest browser-mode settings. Each package needs its own `port`. */
export function browserTest(options: { port: number; include: string[] }): ViteUserConfig['test'];
