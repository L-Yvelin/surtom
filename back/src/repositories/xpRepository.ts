import { RowDataPacket } from 'mysql2/promise';
import pool from './pool.js';

type PlayerXpRow = {
  XP: number;
};

export async function getPlayerXp(playerName: string): Promise<number> {
  const [rows] = await pool.query<(PlayerXpRow & RowDataPacket)[]>(
    `
    SELECT 
      COALESCE(SUM(
        CASE
          WHEN t.Win = 1 THEN 35 - POW(t.AttemptCount - 1, 2)
          ELSE 5
        END
      ), 0) AS XP
    FROM Try t
    WHERE t.PlayerID = (
      SELECT p.ID
      FROM Player p
      WHERE p.Username = ?
    );
    `,
    [playerName],
  );

  return rows[0]?.XP ?? 0;
}
