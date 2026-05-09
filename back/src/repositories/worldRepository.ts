import { db } from '../db/client.js';
import { world } from '../db/schema.js';

export interface WorldRow {
  id: string;
  displayName: string;
  language: string;
}

export async function listWorlds(): Promise<WorldRow[]> {
  const rows = await db
    .select({
      id: world.id,
      displayName: world.displayName,
      language: world.language,
    })
    .from(world)
    .orderBy(world.id);
  return rows;
}
