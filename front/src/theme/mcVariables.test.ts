import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { TEXTURES } from '@surtom/design-system';

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

const TOKEN_VARS = new Set(['--mc-px', '--mc-key-size', '--mc-stone-color', '--mc-diamond-color', '--mc-gold-color']);

describe('design system variables used by the app', () => {
  it('every --mc-* variable used in app CSS is provided by the design system', () => {
    const unknown: string[] = [];
    for (const file of findCssFiles(SRC_DIR)) {
      const content = readFileSync(file, 'utf8');
      for (const match of content.matchAll(CSS_VAR_PATTERN)) {
        if (!declaredVars.has(match[1]) && !TOKEN_VARS.has(match[1])) unknown.push(`${file.slice(SRC_DIR.length + 1)}: ${match[1]}`);
      }
    }
    expect(unknown).toEqual([]);
  });
});
