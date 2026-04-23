import { RowDataPacket } from 'mysql2/promise';
import pool from './pool.js';
import { TryAttributes } from '../dbModels/init-models.js';

export async function getTodaysTriesForPlayer(playerName: string): Promise<string[]> {
  const [rows] = await pool.query<(Pick<TryAttributes, 'Attempts'> & RowDataPacket)[]>(
    `SELECT Attempts FROM Try t
     JOIN Player p ON t.PlayerID = p.ID
     JOIN WordHistory w ON t.WordHistoryID = w.ID
     WHERE p.Username = ? AND DATE(w.AssignedDate) = CURDATE()`,
    [playerName],
  );
  if (!rows.length) return [];
  const parsed: string[][] = JSON.parse(rows[0].Attempts);
  return parsed.map((letters) => letters.join(''));
}

export async function getOrCreateTry(playerId: number, wordHistoryId: number): Promise<{ attempts: string[][]; win: boolean }> {
  const [rows] = await pool.query<(Pick<TryAttributes, 'Attempts' | 'Win'> & RowDataPacket)[]>(
    `SELECT Attempts, Win FROM Try WHERE PlayerID = ? AND WordHistoryID = ?`,
    [playerId, wordHistoryId],
  );

  if (Array.isArray(rows) && rows.length > 0) {
    const row = rows[0];

    const attempts: string[][] = row.Attempts ? JSON.parse(row.Attempts) : [];

    return {
      attempts: Array.isArray(attempts) ? attempts.map((w) => (Array.isArray(w) ? w : [])) : [],
      win: Boolean(row.Win),
    };
  }

  return { attempts: [], win: false };
}

export async function updateTry(playerId: number, wordHistoryId: number, attempts: string[][], win: boolean): Promise<void> {
  await pool.query(
    `INSERT INTO Try (PlayerID, WordHistoryID, Attempts, Win, AttemptCount) VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE Attempts = VALUES(Attempts), Win = VALUES(Win), AttemptCount = VALUES(AttemptCount);`,
    [playerId, wordHistoryId, JSON.stringify(attempts), win, attempts.length],
  );
}
