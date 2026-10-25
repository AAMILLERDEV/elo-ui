import type { ViteUserConfig } from 'vitest/config';

/** Shared Vitest browser-mode config. Each package needs its own `port`. */
export function browserTest(options: {
  port: number;
  include: string[];
  /** Package that component dependencies resolve through, for wrapper packages. */
  depsFrom?: string;
  /** Pre-bundle component dependencies. Defaults to true; core has none. */
  prebundle?: boolean;
}): Pick<ViteUserConfig, 'optimizeDeps' | 'test'>;
