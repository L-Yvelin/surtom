import { createPool, type Pool } from 'mysql2/promise';
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import { env } from '../config/env.js';
import { schema } from './schema.js';

export const pool: Pool = createPool({
  host: env.db.host,
  user: env.db.user,
  port: env.db.port ? Number(env.db.port) : undefined,
  password: env.db.password,
  database: env.db.database,
  charset: env.db.charset,
});

export type Db = MySql2Database<typeof schema>;

export const db: Db = drizzle(pool, { schema, mode: 'default' });

export { schema };
