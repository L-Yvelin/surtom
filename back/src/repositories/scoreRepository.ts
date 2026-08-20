import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { message, player, scoreContent } from '../db/schema.js';

const UNSOLVED = 0;

function winningAttemptCount(attemptsJson: string, answer: string): number {
  const attempts = JSON.parse(attemptsJson);
  if (!Array.isArray(attempts) || attempts.length === 0) return UNSOLVED;

  const lastAttempt = attempts[attempts.length - 1];
  const isWin = Array.isArray(lastAttempt) && lastAttempt.join('') === answer;

  return isWin ? attempts.length : UNSOLVED;
}

export async function getScoreDistribution(username: string, worldId: string = 'fr'): Promise<{ [key: number]: number }> {
  const isUserScore = and(eq(message.type, 'SCORE'), eq(player.username, username), eq(message.worldId, worldId));

  const firstScorePerDay = db
    .select({ firstScoreTime: sql<Date>`MIN(${message.timestamp})`.as('first_score_time') })
    .from(message)
    .innerJoin(player, eq(message.playerId, player.id))
    .where(isUserScore)
    .groupBy(sql`DATE(${message.timestamp})`)
    .as('first_score_per_day');

  const dailyScores = await db
    .select({ attempts: scoreContent.attempts, answer: scoreContent.answer })
    .from(scoreContent)
    .innerJoin(message, eq(scoreContent.id, message.id))
    .innerJoin(player, eq(message.playerId, player.id))
    .innerJoin(firstScorePerDay, eq(message.timestamp, firstScorePerDay.firstScoreTime))
    .where(isUserScore);

  return dailyScores.reduce<Record<number, number>>((gamesByAttemptCount, { attempts, answer }) => {
    const attemptCount = winningAttemptCount(attempts, answer);
    gamesByAttemptCount[attemptCount] = (gamesByAttemptCount[attemptCount] ?? 0) + 1;
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
