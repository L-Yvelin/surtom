import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2/promise';
import pool from './pool.js';
import { PlayerAttributes } from '../dbModels/init-models.js';
import type { Player } from '../models/Player.js';

function mapPlayer(row: PlayerAttributes): Player {
  return {
    id: row.ID,
    username: row.Username,
    password: row.Password,
    sessionHash: row.SessionHash || undefined,
    registrationDate: new Date(row.RegistrationDate),
    isAdmin: row.IsAdmin,
    isBanned: row.IsBanned,
  };
}

export async function getPlayerBySessionHash(hash: string): Promise<Player | undefined> {
  const [results] = await pool.query<(PlayerAttributes & RowDataPacket)[]>('SELECT * FROM Player WHERE SessionHash = ?', [hash]);
  return results.length ? mapPlayer(results[0]) : undefined;
}

export async function getPlayerByName(username: string): Promise<Player | undefined> {
  const [results] = await pool.query<(PlayerAttributes & RowDataPacket)[]>('SELECT * FROM Player WHERE Username = ?', [username]);
  return results.length ? mapPlayer(results[0]) : undefined;
}

export async function registerPlayer(username: string, password: string): Promise<void> {
  const existingPlayer = await getPlayerByName(username);
  if (existingPlayer) {
    throw new Error('Oups, pseudo déjà pris.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO Player (Username, Password) VALUES (?, ?)', [username, hashedPassword]);
}

export async function loginPlayer(username: string, password: string): Promise<Player> {
  const player = await getPlayerByName(username);
  if (!player) {
    throw new Error('Utilisateur inconnu au bataillon...');
  }

  const match = await bcrypt.compare(password, player.password);
  if (!match) {
    throw new Error('Mot de passe invalide !');
  }

  return player;
}

export async function storeSessionHash(playerId: number, sessionHash: string): Promise<void> {
  await pool.query('UPDATE Player SET SessionHash = ? WHERE ID = ?', [sessionHash, playerId]);
}
