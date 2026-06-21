import path from 'node:path';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from './client.js';

const MIGRATIONS_FOLDER = path.resolve(process.cwd(), 'src/db/migrations');

export async function runMigrations(): Promise<void> {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Skipping migrations (RUN_MIGRATIONS=false)');
    return;
  }

  console.log('Running database migrations...');
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  console.log('Migrations up to date');
}
