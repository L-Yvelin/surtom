import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { player } from '../db/schema.js';
import type { Player } from '../models/Player.js';

type PlayerRow = typeof player.$inferSelect;

function mapPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    sessionHash: row.sessionHash ?? undefined,
    registrationDate: row.registrationDate,
    isAdmin: row.isAdmin,
    isBanned: row.isBanned,
  };
}

export async function getPlayerBySessionHash(hash: string): Promise<Player | undefined> {
  const rows = await db.select().from(player).where(eq(player.sessionHash, hash)).limit(1);
  return rows.length ? mapPlayer(rows[0]) : undefined;
}

export async function getPlayerByName(username: string): Promise<Player | undefined> {
  const rows = await db.select().from(player).where(eq(player.username, username)).limit(1);
  return rows.length ? mapPlayer(rows[0]) : undefined;
}

export async function registerPlayer(username: string, password: string): Promise<void> {
  const existingPlayer = await getPlayerByName(username);
  if (existingPlayer) {
    throw new Error('Oups, pseudo déjà pris.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.insert(player).values({ username, password: hashedPassword });
}

export async function loginPlayer(username: string, password: string): Promise<Player> {
  const found = await getPlayerByName(username);
  if (!found) {
    throw new Error('Utilisateur inconnu au bataillon...');
  }

  const match = await bcrypt.compare(password, found.password);
  if (!match) {
    throw new Error('Mot de passe invalide !');
  }

  return found;
}

export async function storeSessionHash(playerId: number, sessionHash: string): Promise<void> {
  await db.update(player).set({ sessionHash }).where(eq(player.id, playerId));
}
