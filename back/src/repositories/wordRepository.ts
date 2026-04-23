import { RowDataPacket } from 'mysql2/promise';
import pool from './pool.js';
import { MotMinecraftAttributes } from '../dbModels/init-models.js';

export async function getTodaysWord(): Promise<string | null> {
  const [results] = await pool.query<(MotMinecraftAttributes & RowDataPacket)[]>(
    `SELECT m.MotMinecraft
    FROM MotMinecraft m, WordHistory w
    WHERE DATE(w.AssignedDate) = CURDATE()
    AND w.WordID = m.ID
    ORDER BY w.AssignedDate DESC
    LIMIT 1;`,
  );
  return results.length ? results[0].MotMinecraft : null;
}

export async function getOrCreateTodaysWord(): Promise<string> {
  const todaysWord = await getTodaysWord();
  if (todaysWord) return todaysWord;

  const [randomWordResults] = await pool.query<(MotMinecraftAttributes & RowDataPacket)[]>(
    `SELECT ID, MotMinecraft FROM MotMinecraft WHERE Rotation = (
      SELECT MIN(Rotation) FROM MotMinecraft
    ) ORDER BY RAND() LIMIT 1;`,
  );
  if (!randomWordResults.length) throw new Error('No words available in MotMinecraft');
  const { ID, MotMinecraft } = randomWordResults[0];

  await pool.query(`INSERT INTO WordHistory (WordID, AssignedDate) VALUES (?, CURDATE());`, [ID]);
  await pool.query(`UPDATE MotMinecraft SET Rotation = Rotation + 1 WHERE ID = ?;`, [ID]);

  return MotMinecraft;
}

export async function getValidWords(word: string): Promise<string[]> {
  const pattern = word[0] + '_'.repeat(word.length - 1);
  const [results] = await pool.query<({ MotValide: string } & RowDataPacket)[]>(
    `SELECT MotMinecraftValide as MotValide
    FROM MotMinecraftValide
    WHERE MotMinecraftValide LIKE ?
    UNION
    SELECT MotFrancais as MotValide
    FROM MotFrancais
    WHERE MotFrancais LIKE ?;`,
    [pattern, pattern],
  );
  return results.length ? results.map((row) => row.MotValide) : [];
}

export async function getTodaysWordAndHistoryId(): Promise<{ wordHistoryId: number; todaysWord: string }> {
  type WordHistoryJoinRow = {
    WordHistoryID: number;
    MotMinecraft: string;
  };
  const [rows] = await pool.query<(WordHistoryJoinRow & RowDataPacket)[]>(
    `SELECT w.ID as WordHistoryID, m.MotMinecraft FROM WordHistory w JOIN MotMinecraft m ON w.WordID = m.ID WHERE DATE(w.AssignedDate) = CURDATE() ORDER BY w.AssignedDate DESC LIMIT 1;`,
  );
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('Mot du jour introuvable.');
  return {
    wordHistoryId: rows[0].WordHistoryID,
    todaysWord: rows[0].MotMinecraft.toUpperCase(),
  };
}
