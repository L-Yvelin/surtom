import path from 'path';
import { createPool, Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Client, Server } from '@surtom/interfaces';
import {
  PlayerAttributes,
  MessageAttributes,
  ScoreContentAttributes,
  MotMinecraftAttributes,
  MotValideCombineAttributes,
  TryAttributes,
} from '../dbModels/init-models';

const dirname = path.resolve();
dotenv.config({ path: path.resolve(dirname, '.env') });

export interface Player {
  id: number;
  username: string;
  password: string;
  sessionHash?: string;
  registrationDate: Date;
  isAdmin: number;
  isBanned: number;
}

class DatabaseService {
  private pool!: Pool;
  private static instance: DatabaseService;

  constructor(dbConfig: Record<string, unknown>) {
    if (!DatabaseService.instance) {
      console.log(dbConfig);

      this.pool = createPool(dbConfig);
      DatabaseService.instance = this;
    }

    return DatabaseService.instance;
  }

  async getTodaysWord(): Promise<string | null> {
    const [results] = await this.pool.query<(MotMinecraftAttributes & RowDataPacket)[]>(
      `SELECT m.MotMinecraft
      FROM MotMinecraft m, WordHistory w
      WHERE DATE(w.AssignedDate) = CURDATE()
      AND w.WordID = m.ID
      ORDER BY w.AssignedDate DESC
      LIMIT 1;`,
    );
    return results.length ? results[0].MotMinecraft : null;
  }

  async getOrCreateTodaysWord(): Promise<string> {
    const todaysWord = await this.getTodaysWord();
    if (todaysWord) return todaysWord;

    const [randomWordResults] = await this.pool.query<(MotMinecraftAttributes & RowDataPacket)[]>(
      `SELECT ID, MotMinecraft FROM MotMinecraft WHERE Rotation = (
        SELECT MIN(Rotation) FROM MotMinecraft
      ) ORDER BY RAND() LIMIT 1;`,
    );
    if (!randomWordResults.length) throw new Error('No words available in MotMinecraft');
    const { ID, MotMinecraft } = randomWordResults[0];

    await this.pool.query(`INSERT INTO WordHistory (WordID, AssignedDate) VALUES (?, CURDATE());`, [ID]);

    await this.pool.query(`UPDATE MotMinecraft SET Rotation = Rotation + 1 WHERE ID = ?;`, [ID]);

    return MotMinecraft;
  }

  async getValidWords(word: string): Promise<string[]> {
    const [results] = await this.pool.query<(MotValideCombineAttributes & RowDataPacket)[]>(
      `SELECT MotValide
      FROM MotValideCombine
      WHERE MotValide LIKE "${word[0] + '_'.repeat(word.length - 1)}";`,
    );
    return results.length ? results.map((row) => row.MotValide) : [];
  }

  async getMessages(includeDeleted = false, max = 200, showHelp = false): Promise<Server.ChatMessage.SavedType[]> {
    const whereClause = includeDeleted ? '' : 'WHERE m.Deleted IS NULL OR m.Deleted = 0';
    const query = `
      SELECT
        m.ID,
        p.Username,
        m.Timestamp,
        m.Type,
        tc.Text,
        tc.ImageData,
        tc.ReplyID,
        sc.Answer,
        sc.Attempts,
        sc.IsCustom,
        p.IsAdmin,
        m.Deleted
      FROM Message m
      JOIN Player p ON m.PlayerID = p.ID
      LEFT JOIN TextContent tc ON m.ID = tc.ID
      LEFT JOIN ScoreContent sc ON m.ID = sc.ID
      ${whereClause}
      ORDER BY m.Timestamp DESC
      LIMIT ?;
    `;
    type MessageJoinRow = {
      ID: number;
      Username: string;
      Timestamp: string | Date;
      Type: string;
      Text: string | null;
      ImageData?: string | null;
      ReplyID?: number | null;
      Answer?: string | null;
      Attempts?: string | null;
      IsCustom?: number | null;
      IsAdmin?: number;
      Deleted?: number | null;
    };
    const [results] = await this.pool.query<(MessageJoinRow & RowDataPacket)[]>(query, [max]);
    const messages = results.length ? results.map((row) => this.mapMessage(row)) : [];
    if (showHelp) {
      messages.unshift(this.getHelpMessage());
    }
    return messages.reverse();
  }

  async getMessageById(id: number): Promise<Server.ChatMessage.SavedType | undefined> {
    type MessageJoinRow = {
      ID: number;
      Username: string;
      Timestamp: string | Date;
      Type: string;
      Text: string | null;
      ImageData?: string | null;
      ReplyID?: number | null;
      Answer?: string | null;
      Attempts?: string | null;
      IsCustom?: number | null;
      IsAdmin?: number;
      Deleted?: number | null;
    };
    const [results] = await this.pool.query<(MessageJoinRow & RowDataPacket)[]>(
      'SELECT m.ID, p.Username, m.Timestamp, m.Type, tc.Text, tc.ImageData, tc.ReplyID, sc.Answer, sc.Attempts, sc.IsCustom, p.IsAdmin, m.Deleted FROM Message m JOIN Player p ON m.PlayerID = p.ID LEFT JOIN TextContent tc ON m.ID = tc.ID LEFT JOIN ScoreContent sc ON m.ID = sc.ID WHERE m.ID = ?',
      [id],
    );
    return results.length ? this.mapMessage(results[0]) : undefined;
  }

  private mapMessage(row: any): Server.ChatMessage.SavedType {
    const baseContent: Server.ChatMessage.Content.BaseMessageContent = {
      id: row.ID.toString(),
      user: {
        name: row.Username,
        moderatorLevel: row.IsAdmin ?? 0,
      },
      timestamp: new Date(row.Timestamp).toISOString(),
      deleted: row.Deleted ?? 0,
    };
    if (row.Type === 'SCORE') {
      return {
        type: Server.MessageType.SCORE,
        content: {
          ...baseContent,
          answer: row.Answer ?? '',
          attempts: row.Attempts ? JSON.parse(row.Attempts) : [],
        },
      } as Server.ChatMessage.SavedType;
    } else {
      const messageType =
        row.Type === 'ENHANCED'
          ? Server.MessageType.ENHANCED
          : row.Type === 'TEXT'
            ? Server.MessageType.TEXT
            : Server.MessageType.PRIVATE_MESSAGE;
      return {
        type: messageType,
        content: {
          ...baseContent,
          text: row.Text ?? '',
          imageData: row.ImageData || undefined,
          replyId: row.ReplyID ? row.ReplyID.toString() : undefined,
        },
      };
    }
  }

  getHelpMessage(): Server.ChatMessage.SavedType {
    return {
      type: Server.MessageType.ENHANCED,
      content: {
        id: '0',
        user: { name: 'System', moderatorLevel: 2 },
        text: '[{"text":"Faites ","color":"LemonChiffon"},{"text":"/help","color":"DarkKhaki"},{"text":" pour plus d\'information","color":"LemonChiffon"}]',
        timestamp: new Date().toISOString(),
        deleted: 0,
      },
    };
  }

  async saveMessage(user: Server.PrivateUser, message: Client.ChatMessage): Promise<Server.Message> {
    const player = await this.getPlayerByName(user.name);
    if (!player) throw new Error('Player not found');

    const timestamp = new Date();
    const [messageResult] = await this.pool.query<ResultSetHeader>('INSERT INTO Message (PlayerID, Timestamp, Type) VALUES (?, ?, ?)', [
      player.id,
      timestamp,
      this.mapMessageType(message.type),
    ]);

    const messageId = messageResult.insertId;

    switch (message.type) {
      case Client.MessageType.SCORE_TO_CHAT: {
        const { custom, attempts } = message.content;
        await this.pool.query('INSERT INTO ScoreContent (ID, Answer, Attempts, IsCustom) VALUES (?, ?, ?, ?)', [
          messageId,
          message.content.custom ? message.content.custom : await this.getTodaysWord(),
          JSON.stringify(attempts),
          !!custom,
        ]);

        return {
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.SCORE,
            content: {
              id: messageId.toString(),
              answer: (await this.getTodaysWord()) ?? '',
              attempts: attempts,
              timestamp: timestamp.toISOString(),
              user: {
                name: user.name,
                moderatorLevel: user.moderatorLevel,
              },
              deleted: 0,
            },
          },
        };
      }
      case Client.MessageType.CHAT_MESSAGE: {
        const { text, imageData, replyId } = message.content;
        await this.pool.query('INSERT INTO TextContent (ID, Text, ImageData, ReplyID) VALUES (?, ?, ?, ?)', [
          messageId,
          text,
          imageData || null,
          replyId ? parseInt(replyId) : null,
        ]);

        return {
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.TEXT,
            content: {
              id: messageId.toString(),
              text: text,
              timestamp: timestamp.toISOString(),
              user: {
                name: user.name,
                moderatorLevel: user.moderatorLevel,
              },
              imageData: imageData,
              replyId: replyId,
              deleted: 0,
            },
          },
        };
      }
      default:
        throw new Error('Unsupported message type');
    }
  }

  private mapMessageType(clientType: Client.MessageType): string {
    switch (clientType) {
      case Client.MessageType.SCORE_TO_CHAT:
        return 'SCORE';
      case Client.MessageType.CHAT_MESSAGE:
      default:
        return 'TEXT';
    }
  }

  async toggleMessage(messageId: number, user: Server.PrivateUser): Promise<boolean> {
    const message = await this.getMessageById(messageId);
    if (!message) return false;

    if (user.moderatorLevel < message.content.deleted && message.content.user.name === user.name) return false;

    const newDeletedStatus = message.content.deleted ? 0 : user.moderatorLevel;

    const [result] = await this.pool.query<ResultSetHeader>('UPDATE Message SET Deleted = ? WHERE ID = ?', [newDeletedStatus, messageId]);
    return result.affectedRows > 0;
  }

  async getLastMessageTimestamp(): Promise<string | null> {
    const [results] = await this.pool.query<(Pick<MessageAttributes, 'Timestamp'> & RowDataPacket)[]>(
      'SELECT Timestamp FROM Message ORDER BY Timestamp DESC LIMIT 1',
    );
    return results.length ? (results[0].Timestamp as unknown as string) : null;
  }

  async getPlayerBySessionHash(hash: string): Promise<Player | undefined> {
    const [results] = await this.pool.query<(PlayerAttributes & RowDataPacket)[]>('SELECT * FROM Player WHERE SessionHash = ?', [hash]);
    return results.length ? this.mapPlayer(results[0]) : undefined;
  }

  async getPlayerByName(username: string): Promise<Player | undefined> {
    const [results] = await this.pool.query<(PlayerAttributes & RowDataPacket)[]>('SELECT * FROM Player WHERE Username = ?', [username]);
    return results.length ? this.mapPlayer(results[0]) : undefined;
  }

  private mapPlayer(row: PlayerAttributes): Player {
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

  async registerPlayer(username: string, password: string): Promise<void> {
    const existingPlayer = await this.getPlayerByName(username);
    if (existingPlayer) {
      throw new Error('Oups, pseudo déjà pris.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.pool.query('INSERT INTO Player (Username, Password) VALUES (?, ?)', [username, hashedPassword]);
  }

  async loginPlayer(username: string, password: string): Promise<Player> {
    const player = await this.getPlayerByName(username);
    if (!player) {
      throw new Error('Utilisateur inconnu au bataillon...');
    }

    const match = await bcrypt.compare(password, player.password);
    if (!match) {
      throw new Error('Mot de passe invalide !');
    }

    return player;
  }

  async storeSessionHash(playerId: number, sessionHash: string): Promise<void> {
    await this.pool.query('UPDATE Player SET SessionHash = ? WHERE ID = ?', [sessionHash, playerId]);
  }

  async getScoreDistribution(username: string): Promise<{ [key: number]: number }> {
    const [results] = await this.pool.query<(Pick<ScoreContentAttributes, 'Attempts'> & RowDataPacket)[]>(
      `
      SELECT sc.Attempts
      FROM ScoreContent sc
      JOIN Message m ON sc.ID = m.ID
      JOIN Player p ON m.PlayerID = p.ID
      WHERE m.Type = 'SCORE'
        AND p.Username = ?
        AND m.ID IN (
          SELECT m2.ID
          FROM Message m2
          JOIN (
            SELECT DATE(m3.Timestamp) as day, MIN(m3.Timestamp) as min_time
            FROM Message m3
            JOIN Player p3 ON m3.PlayerID = p3.ID
            WHERE m3.Type = 'SCORE' AND p3.Username = ?
            GROUP BY DATE(m3.Timestamp)
          ) as firsts
          ON DATE(m2.Timestamp) = firsts.day AND m2.Timestamp = firsts.min_time
          JOIN Player p2 ON m2.PlayerID = p2.ID
          WHERE m2.Type = 'SCORE' AND p2.Username = ?
        )
      `,
      [username, username, username],
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

  async getDailyScore(username: string): Promise<string[][]> {
    const [results] = await this.pool.query<(Pick<ScoreContentAttributes, 'Attempts'> & RowDataPacket)[]>(
      `
      SELECT sc.Attempts
      FROM ScoreContent sc
      JOIN Message m ON sc.ID = m.ID
      JOIN Player p ON m.PlayerID = p.ID
      WHERE m.Type = 'SCORE'
      AND p.Username = ?
      AND DATE(m.Timestamp) = CURDATE();
    `,
      [username],
    );

    return results.length > 0 ? JSON.parse(results[0].Attempts) : [];
  }

  public getPool(): Pool {
    return this.pool;
  }

  async getTodaysTriesForPlayer(playerName: string): Promise<string[]> {
    const [rows] = await this.pool.query<(Pick<TryAttributes, 'Attempts'> & RowDataPacket)[]>(
      `SELECT Attempts FROM Try t
       JOIN Player p ON t.PlayerID = p.ID
       JOIN WordHistory w ON t.WordHistoryID = w.ID
       WHERE p.Username = ? AND DATE(w.AssignedDate) = CURDATE()`,
      [playerName],
    );
    return rows.length ? rows.map((row) => JSON.parse(row.Attempts))[0] : [];
  }

  async getOrCreateTry(playerId: number, wordHistoryId: number): Promise<{ attempts: string[]; win: boolean }> {
    const [rows] = await this.pool.query<(Pick<TryAttributes, 'Attempts' | 'Win'> & RowDataPacket)[]>(
      `SELECT Attempts, Win FROM Try WHERE PlayerID = ? AND WordHistoryID = ?`,
      [playerId, wordHistoryId],
    );
    if (Array.isArray(rows) && rows.length > 0) {
      const row = rows[0];
      return { attempts: JSON.parse(row.Attempts || '[]'), win: !!row.Win };
    } else {
      return { attempts: [], win: false };
    }
  }

  async updateTry(playerId: number, wordHistoryId: number, attempts: string[], win: boolean): Promise<void> {
    await this.pool.query(
      `INSERT INTO Try (PlayerID, WordHistoryID, Attempts, Win, AttemptCount) VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE Attempts = VALUES(Attempts), Win = VALUES(Win), AttemptCount = VALUES(AttemptCount);`,
      [playerId, wordHistoryId, JSON.stringify(attempts), win, attempts.length],
    );
  }

  async getTodaysWordAndHistoryId(): Promise<{
    wordHistoryId: number;
    todaysWord: string;
  }> {
    type WordHistoryJoinRow = {
      WordHistoryID: number;
      MotMinecraft: string;
    };
    const [rows] = await this.pool.query<(WordHistoryJoinRow & RowDataPacket)[]>(
      `SELECT w.ID as WordHistoryID, m.MotMinecraft FROM WordHistory w JOIN MotMinecraft m ON w.WordID = m.ID WHERE DATE(w.AssignedDate) = CURDATE() ORDER BY w.AssignedDate DESC LIMIT 1;`,
    );
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('Mot du jour introuvable.');
    return {
      wordHistoryId: rows[0].WordHistoryID,
      todaysWord: rows[0].MotMinecraft.toUpperCase(),
    };
  }

  async getPlayerXp(playerName: string): Promise<number> {
    return new Promise((resolve) => {
      resolve(0);
    });
  }
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  charset: process.env.DB_CHARSET,
};

const instance = new DatabaseService(dbConfig);
Object.freeze(instance);

export default instance;
