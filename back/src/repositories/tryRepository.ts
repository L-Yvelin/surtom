import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { player, tryTable, wordHistory } from '../db/schema.js';

export async function getTodaysTriesForPlayer(playerName: string): Promise<string[]> {
  const rows = await db
    .select({ attempts: tryTable.attempts })
    .from(tryTable)
    .innerJoin(player, eq(tryTable.playerId, player.id))
    .innerJoin(wordHistory, eq(tryTable.wordHistoryId, wordHistory.id))
    .where(and(eq(player.username, playerName), sql`DATE(${wordHistory.assignedDate}) = CURDATE()`));

  if (!rows.length) return [];
  const parsed: string[][] = JSON.parse(rows[0].attempts);
  return parsed.map((letters) => letters.join(''));
}

export async function getOrCreateTry(playerId: number, wordHistoryId: number): Promise<{ attempts: string[][]; win: boolean }> {
  const rows = await db
    .select({ attempts: tryTable.attempts, win: tryTable.win })
    .from(tryTable)
    .where(and(eq(tryTable.playerId, playerId), eq(tryTable.wordHistoryId, wordHistoryId)))
    .limit(1);

  if (rows.length > 0) {
    const row = rows[0];
    const attempts: string[][] = row.attempts ? JSON.parse(row.attempts) : [];
    return {
      attempts: Array.isArray(attempts) ? attempts.map((w) => (Array.isArray(w) ? w : [])) : [],
      win: Boolean(row.win),
    };
  }

  return { attempts: [], win: false };
}

export async function updateTry(playerId: number, wordHistoryId: number, attempts: string[][], win: boolean): Promise<void> {
  await db
    .insert(tryTable)
    .values({
      playerId,
      wordHistoryId,
      attempts: JSON.stringify(attempts),
      win: win ? 1 : 0,
      attemptCount: attempts.length,
    })
    .onDuplicateKeyUpdate({
      set: {
        attempts: JSON.stringify(attempts),
        win: win ? 1 : 0,
        attemptCount: attempts.length,
      },
    });
}
