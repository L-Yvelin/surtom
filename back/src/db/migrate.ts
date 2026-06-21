import fs from 'node:fs';
import path from 'node:path';
import type { RowDataPacket } from 'mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db, pool } from './client.js';

const MIGRATIONS_FOLDER = path.resolve(process.cwd(), 'src/db/migrations');
const MIGRATIONS_TABLE = '__drizzle_migrations';
const BASELINE_TABLE = 'Player';

async function tableExists(name: string): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?',
    [name],
  );
  return Number(rows[0]?.count ?? 0) > 0;
}

function readFirstMigrationTimestamp(): number {
  const journalPath = path.join(MIGRATIONS_FOLDER, 'meta', '_journal.json');
  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8')) as { entries: { when: number }[] };
  return journal.entries[0]?.when ?? 0;
}

async function baselineIfNeeded(): Promise<void> {
  const trackingExists = await tableExists(MIGRATIONS_TABLE);
  const schemaExists = await tableExists(BASELINE_TABLE);

  if (trackingExists || !schemaExists) return;

  console.log('Existing schema without migration history detected, baselining at initial migration...');
  await pool.query(
    `CREATE TABLE IF NOT EXISTS \`${MIGRATIONS_TABLE}\` (\`id\` serial primary key, \`hash\` text not null, \`created_at\` bigint)`,
  );
  await pool.query(`INSERT INTO \`${MIGRATIONS_TABLE}\` (\`hash\`, \`created_at\`) VALUES (?, ?)`, [
    'baseline_0000',
    readFirstMigrationTimestamp(),
  ]);
}

export async function runMigrations(): Promise<void> {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Skipping migrations (RUN_MIGRATIONS=false)');
    return;
  }

  await baselineIfNeeded();
  console.log('Running database migrations...');
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  console.log('Migrations up to date');
}
