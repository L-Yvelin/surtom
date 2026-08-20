import { and, eq, gte, or } from 'drizzle-orm';
import { MAX_TRIES_PER_GAME } from '@surtom/interfaces';
import { db } from '../db/client.js';
import { message, player, scoreContent, tryTable, wordHistory } from '../db/schema.js';

const UNSOLVED = 0;

export async function getScoreDistribution(username: string, worldId: string = 'fr'): Promise<{ [key: number]: number }> {
  const finishedGames = await db
    .select({ win: tryTable.win, attemptCount: tryTable.attemptCount })
    .from(tryTable)
    .innerJoin(player, eq(tryTable.playerId, player.id))
    .innerJoin(wordHistory, eq(tryTable.wordHistoryId, wordHistory.id))
    .where(
      and(
        eq(player.username, username),
        eq(wordHistory.worldId, worldId),
        or(eq(tryTable.win, 1), gte(tryTable.attemptCount, MAX_TRIES_PER_GAME)),
      ),
    );

  return finishedGames.reduce<Record<number, number>>((gamesByAttemptCount, { win, attemptCount }) => {
    const key = win ? attemptCount : UNSOLVED;
    gamesByAttemptCount[key] = (gamesByAttemptCount[key] ?? 0) + 1;
    return gamesByAttemptCount;
  }, {});
}

export async function getDailyScore(username: string, wordHistoryId: number): Promise<string[][]> {
  const rows = await db
    .select({ attempts: scoreContent.attempts })
    .from(scoreContent)
    .innerJoin(message, eq(scoreContent.id, message.id))
    .innerJoin(player, eq(message.playerId, player.id))
    .where(and(eq(message.type, 'SCORE'), eq(player.username, username), eq(scoreContent.wordHistoryId, wordHistoryId)));

  return rows.length > 0 ? JSON.parse(rows[0].attempts) : [];
}
