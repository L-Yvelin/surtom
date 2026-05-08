import { RowDataPacket } from 'mysql2/promise';
import pool from './pool.js';
import { DEFAULT_LANGUAGE } from '../state/worldRegistry.js';

const DEFAULT_WORLD_ID = 'fr';

export async function getTodaysWord(worldId: string = DEFAULT_WORLD_ID): Promise<string | null> {
  const [results] = await pool.query<({ Word: string } & RowDataPacket)[]>(
    `SELECT m.Word
    FROM MinecraftSolution m
    JOIN WordHistory w ON w.WordID = m.ID
    WHERE DATE(w.AssignedDate) = CURDATE()
      AND w.WorldID = ?
    ORDER BY w.AssignedDate DESC
    LIMIT 1;`,
    [worldId],
  );
  return results.length ? results[0].Word : null;
}

export async function getOrCreateTodaysWord(worldId: string = DEFAULT_WORLD_ID, language: string = DEFAULT_LANGUAGE): Promise<string> {
  const todaysWord = await getTodaysWord(worldId);
  if (todaysWord) return todaysWord;

  const [randomWordResults] = await pool.query<({ ID: number; Word: string } & RowDataPacket)[]>(
    `SELECT ID, Word FROM MinecraftSolution
     WHERE Language = ?
       AND Rotation = (SELECT MIN(Rotation) FROM MinecraftSolution WHERE Language = ?)
     ORDER BY RAND() LIMIT 1;`,
    [language, language],
  );
  if (!randomWordResults.length) throw new Error(`No words available in MinecraftSolution for language ${language}`);
  const { ID, Word } = randomWordResults[0];

  await pool.query(`INSERT INTO WordHistory (WorldID, WordID, AssignedDate) VALUES (?, ?, CURDATE());`, [worldId, ID]);
  await pool.query(`UPDATE MinecraftSolution SET Rotation = Rotation + 1 WHERE ID = ?;`, [ID]);

  return Word;
}

export async function getValidWords(word: string, language: string = DEFAULT_LANGUAGE): Promise<string[]> {
  const pattern = word[0] + '_'.repeat(word.length - 1);
  const [results] = await pool.query<({ Word: string } & RowDataPacket)[]>(
    `SELECT Word FROM MinecraftWord
       WHERE Language = ? AND Word LIKE ?
     UNION
     SELECT Word FROM Dictionary
       WHERE Language = ? AND Word LIKE ?;`,
    [language, pattern, language, pattern],
  );
  return results.length ? results.map((row) => row.Word) : [];
}

export async function getTodaysWordAndHistoryId(
  worldId: string = DEFAULT_WORLD_ID,
): Promise<{ wordHistoryId: number; todaysWord: string }> {
  type WordHistoryJoinRow = {
    WordHistoryID: number;
    Word: string;
  };
  const [rows] = await pool.query<(WordHistoryJoinRow & RowDataPacket)[]>(
    `SELECT w.ID as WordHistoryID, m.Word
     FROM WordHistory w
     JOIN MinecraftSolution m ON w.WordID = m.ID
     WHERE DATE(w.AssignedDate) = CURDATE()
       AND w.WorldID = ?
     ORDER BY w.AssignedDate DESC
     LIMIT 1;`,
    [worldId],
  );
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('Mot du jour introuvable.');
  return {
    wordHistoryId: rows[0].WordHistoryID,
    todaysWord: rows[0].Word.toUpperCase(),
  };
}
