import type { Plugin } from 'vite';

/** Whether `code` contains decorator syntax. */
export function hasDecorators(code: string, fileName?: string): boolean;

/** Lowers TC39 standard decorators in `code` with TypeScript's transpiler. */
export function transpileDecorators(
  code: string,
  fileName: string,
): { code: string; map: object | null };

/** Lowers TC39 standard decorators with TypeScript before Vite's Oxc transform. */
export function tsDecorators(): Plugin;
