import ts from 'typescript';

/**
 * Whether `code` contains decorator syntax. Parses with TypeScript so `@` in strings,
 * comments, JSDoc tags, and CSS (`@media`, `@property`) inside template literals is ignored.
 *
 * @param {string} code
 * @param {string} [fileName]
 */
export function hasDecorators(code, fileName = 'file.ts') {
  if (!code.includes('@')) return false;

  const source = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, false);
  const visit = (node) => node.kind === ts.SyntaxKind.Decorator || ts.forEachChild(node, visit);
  return Boolean(ts.forEachChild(source, visit));
}

/**
 * Lowers TC39 standard decorators in `code` with TypeScript's transpiler.
 *
 * @param {string} code
 * @param {string} fileName
 * @returns {{ code: string, map: object | null }}
 */
export function transpileDecorators(code, fileName) {
  const { outputText, sourceMapText } = ts.transpileModule(code, {
    fileName,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      useDefineForClassFields: true,
      verbatimModuleSyntax: true,
      experimentalDecorators: false,
      sourceMap: true,
      inlineSources: true,
    },
  });
  return { code: outputText, map: sourceMapText ? JSON.parse(sourceMapText) : null };
}

/**
 * Vite 8 transforms TypeScript with Oxc, which only supports legacy decorators and passes
 * standard decorators through untouched (browsers can't run them yet). This plugin lowers
 * them with TypeScript first, only for files that use decorators. Library builds use tsc
 * and don't need it.
 *
 * Remove once Oxc supports standard decorators: `oxc-canary.test.js` fails when it does.
 *
 * @returns {import('vite').Plugin}
 */
export function tsDecorators() {
  return {
    name: 'elo-ui:ts-decorators',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0];
      if (!/\.(m|c)?ts$/.test(file) || file.includes('/node_modules/')) return null;
      if (!hasDecorators(code, file)) return null;
      return transpileDecorators(code, file);
    },
  };
}
