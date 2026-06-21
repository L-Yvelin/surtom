import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { chatRead } from '../db/schema.js';

export async function getChatLastRead(playerId: number, worldId: string): Promise<Date | null> {
  const rows = await db
    .select({ lastReadAt: chatRead.lastReadAt })
    .from(chatRead)
    .where(and(eq(chatRead.playerId, playerId), eq(chatRead.worldId, worldId)))
    .limit(1);
  return rows.length ? rows[0].lastReadAt : null;
}

export async function upsertChatLastRead(playerId: number, worldId: string, date: Date): Promise<void> {
  await db
    .insert(chatRead)
    .values({ playerId, worldId, lastReadAt: date })
    .onDuplicateKeyUpdate({ set: { lastReadAt: date } });
}
