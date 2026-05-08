import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface CliOptions {
  lang: string;
  langFile: string;
  dictFile: string;
  extraFile: string | null;
  outDir: string;
  dryRun: boolean;
  apply: boolean;
}

const GAMEPLAY_KEY_PREFIXES = [
  'block.minecraft.',
  'item.minecraft.',
  'entity.minecraft.',
  'biome.minecraft.',
  'effect.minecraft.',
  'enchantment.minecraft.',
];

const UI_SUFFIX_SEGMENTS = new Set([
  'desc',
  'applies_to',
  'fade_to',
  'fullness',
  'full',
  'select',
  'update',
  'named',
  'empty',
  'custom_color',
]);

const INTERNAL_ENTITIES = new Set([
  'marker',
  'interaction',
  'item',
  'item_display',
  'block_display',
  'text_display',
  'area_effect_cloud',
  'experience_orb',
  'lightning_bolt',
  'fishing_bobber',
  'leash_knot',
  'eye_of_ender',
  'falling_block',
]);

const MIN_LEN = 3;
const MAX_LEN = 15;

const STOPWORDS_BY_LANG: Record<string, Set<string>> = {
  en: new Set([
    'the',
    'and',
    'with',
    'into',
    'from',
    'for',
    'off',
    'out',
    'are',
    'was',
    'this',
    'that',
    'they',
    'their',
    'there',
    'has',
    'had',
    'have',
    'not',
    'but',
    'all',
    'any',
    'one',
    'two',
    'three',
    'four',
    'five',
    'old',
    'new',
    'his',
    'her',
    'who',
    'why',
    'how',
    'when',
    'where',
  ]),
  fr: new Set([
    'des',
    'les',
    'aux',
    'que',
    'qui',
    'par',
    'pour',
    'sur',
    'sous',
    'avec',
    'dans',
    'son',
    'sa',
    'ses',
    'ces',
    'cette',
    'cet',
    'une',
    'mon',
    'ton',
    'nos',
    'vos',
    'leur',
    'leurs',
    'est',
    'sont',
    'mais',
    'donc',
    'tout',
    'tous',
    'toute',
    'toutes',
  ]),
};

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function tokenizeValue(raw: string, stopwords: Set<string>): string[] {
  const stripped = stripDiacritics(raw).trim();
  if (!stripped) return [];
  const apostropheStripped = stripped.replace(/['’]/g, ' ');
  const tokens = apostropheStripped.split(/[\s\-_]+/);
  const out: string[] = [];
  for (const token of tokens) {
    if (!/^[A-Za-z]+$/.test(token)) continue;
    const lower = token.toLowerCase();
    if (lower.length < MIN_LEN || lower.length > MAX_LEN) continue;
    if (stopwords.has(lower)) continue;
    out.push(lower);
  }
  return out;
}

function normalizeWord(raw: string, stopwords: Set<string>): string | null {
  const tokens = tokenizeValue(raw, stopwords);
  if (tokens.length !== 1) return null;
  return tokens[0];
}

function isGameplayEntry(key: string, value: string): boolean {
  if (!GAMEPLAY_KEY_PREFIXES.some((p) => key.startsWith(p))) return false;
  if (typeof value !== 'string') return false;
  if (value.includes(' - ')) return false;
  if (value.includes('%')) return false;

  const segments = key.split('.');
  const lastSegment = segments[segments.length - 1];
  if (UI_SUFFIX_SEGMENTS.has(lastSegment)) return false;
  if (lastSegment.includes('description')) return false;

  if (key.startsWith('entity.minecraft.') && segments.length === 3 && INTERNAL_ENTITIES.has(lastSegment)) {
    return false;
  }

  return true;
}

function extractMinecraftNouns(langJsonPath: string, lang: string): { all: string[]; singleToken: string[] } {
  const raw = fs.readFileSync(langJsonPath, 'utf8');
  const data = JSON.parse(raw) as Record<string, string>;
  const stopwords = STOPWORDS_BY_LANG[lang] ?? new Set<string>();

  const single = new Set<string>();
  const all = new Set<string>();
  for (const [key, value] of Object.entries(data)) {
    if (!isGameplayEntry(key, value)) continue;
    const tokens = tokenizeValue(value, stopwords);
    if (tokens.length === 1) single.add(tokens[0]);
    for (const t of tokens) all.add(t);
  }
  return {
    all: [...all].sort(),
    singleToken: [...single].sort(),
  };
}

function readWordList(filePath: string, lang: string): string[] {
  const out = new Set<string>();
  const stopwords = STOPWORDS_BY_LANG[lang] ?? new Set<string>();
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const lineRaw of raw.split(/\r?\n/)) {
    const line = lineRaw.trim();
    if (!line || line.startsWith('#')) continue;
    const word = normalizeWord(line, stopwords);
    if (word) out.add(word);
  }
  return [...out].sort();
}

function parseArgs(argv: string[]): CliOptions {
  const opts: Partial<CliOptions> = {
    dryRun: true,
    apply: false,
    extraFile: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = (): string => {
      const v = argv[i + 1];
      if (!v) throw new Error(`Missing value for ${arg}`);
      i++;
      return v;
    };
    switch (arg) {
      case '--lang':
        opts.lang = next();
        break;
      case '--lang-file':
        opts.langFile = next();
        break;
      case '--dict':
        opts.dictFile = next();
        break;
      case '--extra':
        opts.extraFile = next();
        break;
      case '--out':
        opts.outDir = next();
        break;
      case '--apply':
        opts.apply = true;
        opts.dryRun = false;
        break;
      case '--dry-run':
        opts.dryRun = true;
        opts.apply = false;
        break;
      default:
        throw new Error(`Unknown arg: ${arg}`);
    }
  }
  if (!opts.lang) throw new Error('--lang is required');
  if (!opts.langFile) throw new Error('--lang-file is required');
  if (!opts.dictFile) throw new Error('--dict is required');
  if (!opts.outDir) opts.outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'seed-output');
  return opts as CliOptions;
}

function writeList(filePath: string, words: string[]): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, words.join('\n') + (words.length ? '\n' : ''), 'utf8');
}

async function applyToDb(opts: { lang: string; dictionary: string[]; solutions: string[]; minecraftWords: string[] }): Promise<void> {
  const { default: pool } = await import('../src/repositories/pool.js');

  const batch = async (sql: string, rows: unknown[][]): Promise<number> => {
    if (rows.length === 0) return 0;
    let total = 0;
    for (let i = 0; i < rows.length; i += 1000) {
      const chunk = rows.slice(i, i + 1000);
      const [res] = await pool.query<{ affectedRows: number } & { [k: string]: unknown }>(sql, [chunk]);
      total += (res as { affectedRows: number }).affectedRows ?? 0;
    }
    return total;
  };

  console.log(`Inserting ${opts.dictionary.length} dictionary rows...`);
  const dictAffected = await batch(
    'INSERT IGNORE INTO Dictionary (Language, Word) VALUES ?',
    opts.dictionary.map((w) => [opts.lang, w]),
  );
  console.log(`  Dictionary: ${dictAffected} new rows.`);

  console.log(`Inserting ${opts.solutions.length} MinecraftSolution rows...`);
  const solAffected = await batch(
    'INSERT IGNORE INTO MinecraftSolution (Language, Word) VALUES ?',
    opts.solutions.map((w) => [opts.lang, w]),
  );
  console.log(`  MinecraftSolution: ${solAffected} new rows.`);

  console.log(`Inserting ${opts.minecraftWords.length} MinecraftWord rows...`);
  const wordAffected = await batch(
    'INSERT IGNORE INTO MinecraftWord (Language, Word) VALUES ?',
    opts.minecraftWords.map((w) => [opts.lang, w]),
  );
  console.log(`  MinecraftWord: ${wordAffected} new rows.`);

  await pool.end();
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));

  console.log(`# seed-language-words --lang ${opts.lang} (${opts.dryRun ? 'dry-run' : 'apply'})`);

  const dictionary = readWordList(opts.dictFile, opts.lang);
  const { all: extractedAll, singleToken: extractedSingle } = extractMinecraftNouns(opts.langFile, opts.lang);
  const extras = opts.extraFile && fs.existsSync(opts.extraFile) ? readWordList(opts.extraFile, opts.lang) : [];

  const solutions = extractedSingle;
  const minecraftWords = [...new Set([...extractedAll, ...extras])].sort();

  console.log(`Dictionary candidates:           ${dictionary.length}`);
  console.log(`MinecraftSolution candidates:    ${solutions.length}    (single-token only)`);
  console.log(`MinecraftWord candidates:        ${minecraftWords.length}  (all tokens + ${extras.length} extras)`);

  if (opts.dryRun) {
    const outDir = path.join(opts.outDir, opts.lang);
    writeList(path.join(outDir, 'dictionary.txt'), dictionary);
    writeList(path.join(outDir, 'minecraft-solutions.txt'), solutions);
    writeList(path.join(outDir, 'minecraft-words.txt'), minecraftWords);
    console.log(`\nDry-run output written to: ${outDir}`);
    console.log('Sample MinecraftSolution (first 30):');
    console.log('  ' + solutions.slice(0, 30).join(', '));
    console.log('Sample MinecraftWord (first 30):');
    console.log('  ' + minecraftWords.slice(0, 30).join(', '));
    return;
  }

  await applyToDb({
    lang: opts.lang,
    dictionary,
    solutions,
    minecraftWords,
  });
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
