import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { message, minecraftSolution, player, scoreContent, tryTable, wordHistory } from '../db/schema.js';

const UNSOLVED = 0;

function parseAttempts(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((attempt) => (Array.isArray(attempt) ? attempt.join('') : String(attempt)));
  } catch {
    return [];
  }
}

function scoreBucket(attempts: string[], answer: string): number | null {
  if (attempts.length === 0) return null;
  const won = attempts[attempts.length - 1].toUpperCase() === answer.toUpperCase();
  return won ? attempts.length : UNSOLVED;
}

export async function getScoreDistribution(username: string, worldId: string = 'fr'): Promise<{ [key: number]: number }> {
  const games = await db
    .select({ attempts: tryTable.attempts, answer: minecraftSolution.word })
    .from(tryTable)
    .innerJoin(player, eq(tryTable.playerId, player.id))
    .innerJoin(wordHistory, eq(tryTable.wordHistoryId, wordHistory.id))
    .innerJoin(minecraftSolution, eq(wordHistory.wordId, minecraftSolution.id))
    .where(and(eq(player.username, username), eq(wordHistory.worldId, worldId)));

  return games.reduce<Record<number, number>>((gamesByAttemptCount, { attempts, answer }) => {
    const bucket = scoreBucket(parseAttempts(attempts), answer);
    if (bucket === null) return gamesByAttemptCount;
    gamesByAttemptCount[bucket] = (gamesByAttemptCount[bucket] ?? 0) + 1;
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
