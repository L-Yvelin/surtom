import { createPool, Pool } from 'mysql2/promise';
import { env } from '../config/env.js';

const pool: Pool = createPool({
  host: env.db.host,
  user: env.db.user,
  port: env.db.port ? Number(env.db.port) : undefined,
  password: env.db.password,
  database: env.db.database,
  charset: env.db.charset,
});

export default pool;
