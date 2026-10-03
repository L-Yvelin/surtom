import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { TEXTURES } from './textures';

const SRC_DIR = resolve(__dirname, '..');
const CSS_VAR_PATTERN = /var\(\s*(--mc-[a-z0-9-]+)\s*\)/g;

function findCssFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...findCssFiles(full));
    else if (entry.name.endsWith('.css')) files.push(full);
  }
  return files;
}

const declaredVars = new Set(
  Object.values(TEXTURES)
    .map((entry) => ('cssVar' in entry ? entry.cssVar : undefined))
    .filter((cssVar): cssVar is string => !!cssVar),
);

const cssFiles = findCssFiles(SRC_DIR);
const usedVars = new Map<string, string[]>();
const filesWithAlias: string[] = [];

for (const file of cssFiles) {
  const content = readFileSync(file, 'utf8');
  const relative = file.slice(SRC_DIR.length + 1);
  if (content.includes('@mc/')) filesWithAlias.push(relative);
  for (const match of content.matchAll(CSS_VAR_PATTERN)) {
    const name = match[1];
    usedVars.set(name, [...(usedVars.get(name) ?? []), relative]);
  }
}

const GLOBAL_MC_VARS = new Set([
  '--mc-px',
  '--mc-key-size',
  '--mc-stone-color',
  '--mc-diamond-color',
  '--mc-gold-color',
  '--mc-diamond-glow',
  '--mc-gold-glow',
]);

describe('texture registry consistency', () => {
  it('every --mc-* variable used in CSS is declared in the registry', () => {
    const unknown = [...usedVars.entries()].filter(([name]) => !declaredVars.has(name) && !GLOBAL_MC_VARS.has(name));
    expect(unknown).toEqual([]);
  });

  it('no CSS references the @mc alias directly (must go through --mc-* variables)', () => {
    expect(filesWithAlias).toEqual([]);
  });

  it('declares each css variable only once', () => {
    const all = Object.values(TEXTURES)
      .map((entry) => ('cssVar' in entry ? entry.cssVar : undefined))
      .filter((cssVar): cssVar is string => !!cssVar);
    expect(new Set(all).size).toBe(all.length);
  });
});
