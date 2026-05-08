import { RowDataPacket } from 'mysql2/promise';
import pool from './pool.js';
import { ScoreContentAttributes } from '../dbModels/init-models.js';

export async function getScoreDistribution(username: string, worldId: string = 'fr'): Promise<{ [key: number]: number }> {
  const [results] = await pool.query<(Pick<ScoreContentAttributes, 'Attempts'> & RowDataPacket)[]>(
    `
    SELECT sc.Attempts
    FROM ScoreContent sc
    JOIN Message m ON sc.ID = m.ID
    JOIN Player p ON m.PlayerID = p.ID
    WHERE m.Type = 'SCORE'
      AND p.Username = ?
      AND m.WorldID = ?
      AND m.ID IN (
        SELECT m2.ID
        FROM Message m2
        JOIN (
          SELECT DATE(m3.Timestamp) as day, MIN(m3.Timestamp) as min_time
          FROM Message m3
          JOIN Player p3 ON m3.PlayerID = p3.ID
          WHERE m3.Type = 'SCORE' AND p3.Username = ? AND m3.WorldID = ?
          GROUP BY DATE(m3.Timestamp)
        ) as firsts
        ON DATE(m2.Timestamp) = firsts.day AND m2.Timestamp = firsts.min_time
        JOIN Player p2 ON m2.PlayerID = p2.ID
        WHERE m2.Type = 'SCORE' AND p2.Username = ? AND m2.WorldID = ?
      )
    `,
    [username, worldId, username, worldId, username, worldId],
  );

  return results.reduce(
    (acc, row) => {
      const attempts = JSON.parse(row.Attempts).length;
      acc[attempts] = (acc[attempts] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );
}

export async function getDailyScore(username: string, wordHistoryId: number): Promise<string[][]> {
  const [rows] = await pool.query<(Pick<ScoreContentAttributes, 'Attempts'> & RowDataPacket)[]>(
    `
    SELECT sc.Attempts
    FROM ScoreContent sc
    JOIN Message m ON sc.ID = m.ID
    JOIN Player p ON m.PlayerID = p.ID
    WHERE m.Type = 'SCORE'
      AND p.Username = ?
      AND sc.WordHistoryID = ?;
    `,
    [username, wordHistoryId],
  );
  return rows.length > 0 ? JSON.parse(rows[0].Attempts) : [];
}
