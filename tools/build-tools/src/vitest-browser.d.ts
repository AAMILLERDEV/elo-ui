import type { ViteUserConfig } from 'vitest/config';

/** Shared Vitest browser-mode config. Each package needs its own `port`. */
export function browserTest(options: {
  port: number;
  include: string[];
  /** Package Lit is resolved through, for packages that don't depend on Lit directly. */
  litFrom?: string;
}): Pick<ViteUserConfig, 'optimizeDeps' | 'test'>;
