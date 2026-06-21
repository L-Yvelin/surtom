import path from 'node:path';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from './client.js';

export async function runMigrations(): Promise<void> {
  if (process.env.RUN_MIGRATIONS === 'false') {
    console.log('Skipping migrations (RUN_MIGRATIONS=false)');
    return;
  }

  const migrationsFolder = path.resolve(process.cwd(), 'src/db/migrations');
  console.log('Running database migrations...');
  await migrate(db, { migrationsFolder });
  console.log('Migrations up to date');
}
