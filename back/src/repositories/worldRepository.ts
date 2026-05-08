import { RowDataPacket } from 'mysql2/promise';
import pool from './pool.js';

export interface WorldRow {
  id: string;
  displayName: string;
  language: string;
}

interface WorldRowDb extends RowDataPacket {
  ID: string;
  DisplayName: string;
  Language: string;
}

export async function listWorlds(): Promise<WorldRow[]> {
  const [rows] = await pool.query<WorldRowDb[]>('SELECT `ID`, `DisplayName`, `Language` FROM `World` ORDER BY `ID`');
  return rows.map((r) => ({ id: r.ID, displayName: r.DisplayName, language: r.Language }));
}
