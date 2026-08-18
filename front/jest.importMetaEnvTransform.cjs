/**
 * Custom Jest transform that rewrites Vite-only `import.meta.env.X` reads to `process.env.X`
 * before TypeScript compilation. This lets files like useWebSocketStore.ts (which read
 * VITE_* variables via import.meta.env) compile in Jest's CommonJS mode — TS refuses to parse
 * `import.meta` under a CommonJS module target — while still working normally under Vite.
 */
const ts = require('typescript');
const path = require('path');

function rewriteImportMetaEnv(source) {
  return source.replace(/import\.meta\.env\.(\w+)/g, 'process.env.$1');
}

module.exports = {
  process(source, filename) {
    const ext = path.extname(filename);
    const isTsx = ext === '.tsx' || ext === '.jsx';

    const result = ts.transpileModule(rewriteImportMetaEnv(source), {
      fileName: filename,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: isTsx ? ts.JsxEmit.ReactJSX : ts.JsxEmit.Preserve,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        allowJs: true,
        skipLibCheck: true,
      },
    });

    return { code: result.outputText };
  },
};
