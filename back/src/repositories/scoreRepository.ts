import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { message, player, scoreContent } from '../db/schema.js';

export async function getScoreDistribution(username: string, worldId: string = 'fr'): Promise<{ [key: number]: number }> {
  const result = await db.execute<{ Attempts: string }>(
    sql`
      SELECT sc.Attempts AS Attempts
      FROM ${scoreContent} sc
      JOIN ${message} m ON sc.ID = m.ID
      JOIN ${player} p ON m.PlayerID = p.ID
      WHERE m.Type = 'SCORE'
        AND p.Username = ${username}
        AND m.WorldID = ${worldId}
        AND m.ID IN (
          SELECT m2.ID
          FROM ${message} m2
          JOIN (
            SELECT DATE(m3.Timestamp) AS day, MIN(m3.Timestamp) AS min_time
            FROM ${message} m3
            JOIN ${player} p3 ON m3.PlayerID = p3.ID
            WHERE m3.Type = 'SCORE' AND p3.Username = ${username} AND m3.WorldID = ${worldId}
            GROUP BY DATE(m3.Timestamp)
          ) AS firsts ON DATE(m2.Timestamp) = firsts.day AND m2.Timestamp = firsts.min_time
          JOIN ${player} p2 ON m2.PlayerID = p2.ID
          WHERE m2.Type = 'SCORE' AND p2.Username = ${username} AND m2.WorldID = ${worldId}
        )
    `,
  );
  const rows = result[0] as unknown as Array<{ Attempts: string }>;
  return rows.reduce(
    (acc, row) => {
      const attempts = JSON.parse(row.Attempts).length;
      acc[attempts] = (acc[attempts] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );
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
