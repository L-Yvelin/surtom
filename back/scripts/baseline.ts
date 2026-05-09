import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../src/repositories/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '../src/db/migrations');
const JOURNAL_PATH = path.join(MIGRATIONS_DIR, 'meta', '_journal.json');

interface JournalEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
}

interface Journal {
  version: string;
  dialect: string;
  entries: JournalEntry[];
}

async function main(): Promise<void> {
  if (!fs.existsSync(JOURNAL_PATH)) {
    console.error(`No journal at ${JOURNAL_PATH}`);
    process.exit(1);
  }

  const journal: Journal = JSON.parse(fs.readFileSync(JOURNAL_PATH, 'utf8'));

  console.log('Creating __drizzle_migrations tracking table if missing...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  console.log(`Marking ${journal.entries.length} migration(s) as applied...`);
  for (const entry of journal.entries) {
    const sqlPath = path.join(MIGRATIONS_DIR, `${entry.tag}.sql`);
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    const hash = crypto.createHash('sha256').update(sqlContent).digest('hex');

    const [rows] = await pool.query<{ id: number; hash: string; created_at: string }[] & { length: number }>(
      'SELECT id, hash, created_at FROM `__drizzle_migrations` WHERE hash = ?',
      [hash],
    );

    if ((rows as unknown as { length: number }).length > 0) {
      console.log(`  already baselined: ${entry.tag}`);
      continue;
    }

    await pool.query('INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) VALUES (?, ?)', [hash, entry.when]);
    console.log(`  baselined: ${entry.tag}`);
  }

  console.log('\nBaseline complete. `npm run db:migrate` will now skip these migrations.');
  await pool.end();
}

main().catch(async (err) => {
  console.error('Baseline failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
