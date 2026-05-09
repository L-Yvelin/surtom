import { sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { player, tryTable } from '../db/schema.js';

export async function getPlayerXp(playerName: string): Promise<number> {
  const rows = await db
    .select({
      xp: sql<number>`COALESCE(SUM(CASE WHEN ${tryTable.win} = 1 THEN 35 - POW(${tryTable.attemptCount} - 1, 2) ELSE 5 END), 0)`,
    })
    .from(tryTable)
    .where(sql`${tryTable.playerId} = (SELECT ${player.id} FROM ${player} WHERE ${player.username} = ${playerName})`);

  return Number(rows[0]?.xp ?? 0);
}
