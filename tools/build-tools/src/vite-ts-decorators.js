import ts from 'typescript';

// Parses rather than regex-matching, so `@` in strings, comments, and CSS is ignored.
export function hasDecorators(code, fileName = 'file.ts') {
  if (!code.includes('@')) return false;

  const source = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, false);
  const visit = (node) => node.kind === ts.SyntaxKind.Decorator || ts.forEachChild(node, visit);
  return Boolean(ts.forEachChild(source, visit));
}

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

// Oxc skips standard decorators; remove this plugin when oxc-canary.test.js fails.
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
