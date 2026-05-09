import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import pool from '../repositories/pool.js';
import { schema } from './schema.js';

export type Db = MySql2Database<typeof schema>;

export const db: Db = drizzle(pool, { schema, mode: 'default' });

export { schema };
