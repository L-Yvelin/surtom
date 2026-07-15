/**
 * Custom Jest transform that replaces Vite-only import.meta.glob() calls with {}
 * before TypeScript compilation. This lets files like textures.ts compile in Jest's
 * CommonJS mode while still working normally in the Vite production build.
 */
const ts = require('typescript');
const path = require('path');

function stripImportMetaGlob(source) {
  // Replace import.meta.glob(...) possibly followed by `as Type` with {}
  return source.replace(/import\.meta\.glob\s*\([^)]*\)(\s*as\s+[^\n;{]+)?/gs, '{}');
}

module.exports = {
  process(source, filename) {
    const ext = path.extname(filename);
    const isTsx = ext === '.tsx' || ext === '.jsx';

    const result = ts.transpileModule(stripImportMetaGlob(source), {
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
