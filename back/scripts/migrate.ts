import 'dotenv/config';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from '../src/db/client.js';
import pool from '../src/repositories/pool.js';

async function main(): Promise<void> {
  console.log('Running Drizzle migrations from src/db/migrations...');
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('Migrations applied successfully.');
  await pool.end();
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
