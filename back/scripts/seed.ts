import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, pool } from '../src/db/client.js';
import { dictionary, minecraftSolution, minecraftWord, player, world } from '../src/db/schema.js';
import type { MySqlTable } from 'drizzle-orm/mysql-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_OUTPUT_DIR = path.resolve(__dirname, '..', 'data', 'seed-output');
const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;
const BATCH_SIZE = 1000;

const DEFAULT_WORLDS = [
  { id: 'fr', displayName: 'Français', language: 'fr' },
  { id: 'en', displayName: 'English', language: 'en' },
];

const SYSTEM_PLAYERS = [
  'System',
  'Surtomien',
  'Cracotto',
  'Marmeluche',
  'Ziboulette',
  'Bidulette',
  'Farfelucho',
  'Patacroute',
  'Zozo',
  'Frimousse',
  'Zigzag',
  'Turlututu',
  'Bouboule',
  'Cacahuete',
  'ChocoBrioche',
  'Roudoudou',
  'Cornichon',
  'Choupette',
  'Bibop',
  'Tornade',
  'Cocorico',
  'Biscotto',
  'Frisottis',
  'Barbapapa',
  'Rigolito',
  'Loufoquet',
  'Gribouille',
  'Papouille',
];

function readLines(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

async function bulkInsertIgnore<T extends Record<string, unknown>>(table: MySqlTable, rows: T[]): Promise<void> {
  if (rows.length === 0) return;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    await db.insert(table).ignore().values(chunk);
  }
}

async function seedWorlds(): Promise<void> {
  console.log(`Seeding ${DEFAULT_WORLDS.length} default world(s)...`);
  await db
    .insert(world)
    .values(DEFAULT_WORLDS)
    .onDuplicateKeyUpdate({ set: { id: world.id } });
}

async function seedSystemPlayers(): Promise<void> {
  console.log(`Seeding ${SYSTEM_PLAYERS.length} system/funny-name player(s)...`);
  const rows = SYSTEM_PLAYERS.map((username) => ({ username, password: '-1', isBanned: 1 }));
  await db
    .insert(player)
    .values(rows)
    .onDuplicateKeyUpdate({ set: { username: player.username } });
}

async function seedWordsForLanguage(lang: string): Promise<void> {
  const dir = path.join(SEED_OUTPUT_DIR, lang);
  if (!fs.existsSync(dir)) {
    console.log(`  ${lang}: no seed-output directory at ${dir}, skipping.`);
    return;
  }

  const dictionaryWords = readLines(path.join(dir, 'dictionary.txt'));
  const minecraftWords = readLines(path.join(dir, 'minecraft-words.txt'));
  const minecraftSolutions = readLines(path.join(dir, 'minecraft-solutions.txt'));

  console.log(
    `  ${lang}: loading ${dictionaryWords.length} dictionary, ${minecraftWords.length} minecraft-words, ${minecraftSolutions.length} minecraft-solutions`,
  );

  await bulkInsertIgnore(
    dictionary,
    dictionaryWords.map((w) => ({ language: lang, word: w })),
  );
  await bulkInsertIgnore(
    minecraftWord,
    minecraftWords.map((w) => ({ language: lang, word: w })),
  );
  await bulkInsertIgnore(
    minecraftSolution,
    minecraftSolutions.map((w) => ({ language: lang, word: w })),
  );
}

async function seedWords(): Promise<void> {
  console.log(`Seeding word lists from ${path.relative(process.cwd(), SEED_OUTPUT_DIR)}...`);
  for (const lang of SUPPORTED_LANGUAGES) {
    await seedWordsForLanguage(lang);
  }
}

async function main(): Promise<void> {
  await seedWorlds();
  await seedSystemPlayers();
  await seedWords();
  console.log('\nSeed complete.');
  console.log('To regenerate word lists from raw Minecraft lang files / dictionaries, use:');
  console.log('  npm run db:seed:words -- --lang <fr|en> --lang-file ... --dict ...');
  await pool.end();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
