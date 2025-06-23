import path from "path";
import { createPool, Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Client, Server } from "src/models/Message";

const dirname = path.resolve();
dotenv.config({ path: path.resolve(dirname, ".env") });

export interface Player {
  id: number;
  username: string;
  password: string;
  sessionHash?: string;
  registrationDate: Date;
  isAdmin: number;
  isBanned: number;
}

interface MessageRow {
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
}

interface PlayerRow {
  ID: number;
  Username: string;
  Password: string;
  SessionHash?: string | null;
  RegistrationDate: string | Date;
  IsAdmin: number;
  IsBanned: number;
}

interface ScoreContentRow {
  Attempts: string;
}

class DatabaseService {
  private pool!: Pool;
  private static instance: DatabaseService;

  constructor(dbConfig: Record<string, unknown>) {
    if (!DatabaseService.instance) {
      this.pool = createPool(dbConfig);
      DatabaseService.instance = this;
    }

    return DatabaseService.instance;
  }

  async getTodaysWord(): Promise<string | null> {
    const [results] = await this.pool.query<RowDataPacket[]>(`
      SELECT m.MotMinecraft
      FROM MotMinecraft m, WordHistory w
      WHERE DATE(w.AssignedDate) = CURDATE()
      AND w.WordID = m.ID
      ORDER BY w.AssignedDate DESC
      LIMIT 1;
    `);
    return results.length ? (results[0] as { MotMinecraft: string }).MotMinecraft : null;
  }

  async getValidWords(word: string): Promise<string[]> {
    const [results] = await this.pool.query<RowDataPacket[]>(`
      SELECT MotValide
      FROM MotValideCombine
      WHERE MotValide LIKE "${word[0] + "_".repeat(word.length - 1)}";`);
    return results.map((row) => (row as { MotValide: string }).MotValide);
  }

  async getMessages(
    includeDeleted = false,
    max = 200,
    showHelp = false
  ): Promise<Server.ChatMessage.SavedType[]> {
    const whereClause = includeDeleted ? "" : "WHERE m.Deleted IS NULL OR m.Deleted = 0";
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
    const [results] = await this.pool.query<RowDataPacket[]>(query, [max]);
    const messages = (results as MessageRow[]).map((row) => this.mapMessage(row));
    if (showHelp) {
      messages.unshift(this.getHelpMessage());
    }
    return messages.reverse();
  }

  async getMessageById(
    id: number
  ): Promise<Server.ChatMessage.SavedType | null> {
    const [results] = await this.pool.query<RowDataPacket[]>(
      "SELECT m.ID, p.Username, m.Timestamp, m.Type, tc.Text, tc.ImageData, tc.ReplyID, sc.Answer, sc.Attempts, sc.IsCustom, p.IsAdmin, m.Deleted FROM Message m JOIN Player p ON m.PlayerID = p.ID LEFT JOIN TextContent tc ON m.ID = tc.ID LEFT JOIN ScoreContent sc ON m.ID = sc.ID WHERE m.ID = ?",
      [id]
    );
    return (results as MessageRow[]).length
      ? this.mapMessage((results as MessageRow[])[0])
      : null;
  }

  private mapMessage(row: MessageRow): Server.ChatMessage.SavedType {
    const baseContent: Server.ChatMessage.Content.BaseMessageContent = {
      id: row.ID.toString(),
      user: {
        name: row.Username,
        moderatorLevel: row.IsAdmin ?? 0,
      },
      timestamp: new Date(row.Timestamp).toISOString(),
      deleted: row.Deleted ?? 0,
    };
    if (row.Type === "SCORE") {
      return {
        type: Server.MessageType.SCORE,
        content: {
          ...baseContent,
          answer: row.Answer ?? "",
          attempts: row.Attempts ? JSON.parse(row.Attempts) : [],
        },
      };
    } else {
      const messageType =
        row.Type === "ENHANCED_MESSAGE"
          ? Server.MessageType.ENHANCED_MESSAGE
          : row.Type === "MAIL_ALL"
            ? Server.MessageType.MAIL_ALL
            : Server.MessageType.PRIVATE_MESSAGE;
      return {
        type: messageType,
        content: {
          ...baseContent,
          text: row.Text ?? "",
          imageData: row.ImageData || undefined,
          replyId: row.ReplyID ? row.ReplyID.toString() : undefined,
        },
      };
    }
  }

  getHelpMessage(): Server.ChatMessage.SavedType {
    return {
      type: Server.MessageType.ENHANCED_MESSAGE,
      content: {
        id: "0",
        user: { name: "System", moderatorLevel: 2 },
        text: '[{"text":"Faites ","color":"LemonChiffon"},{"text":"/help","color":"DarkKhaki","clickable":"toggleChat(\'\');toggleChat(\'/help\')"},{"text":" pour plus d\'information","color":"LemonChiffon"}]',
        timestamp: new Date().toISOString(),
        deleted: 0,
      },
    };
  }

  async saveMessage(
    user: Server.PrivateUser,
    message: Client.ChatMessage
  ): Promise<Server.Message> {
    const player = await this.getPlayerByName(user.name);
    if (!player) throw new Error("Player not found");

    const timestamp = new Date();
    const [messageResult] = await this.pool.query<ResultSetHeader>(
      "INSERT INTO Message (PlayerID, Timestamp, Type) VALUES (?, ?, ?)",
      [player.id, timestamp, this.mapMessageType(message.type)]
    );

    const messageId = messageResult.insertId;

    switch (message.type) {
      case Client.MessageType.SCORE_TO_CHAT: {
        const { custom, attempts } = message.content;
        await this.pool.query(
          "INSERT INTO ScoreContent (ID, Answer, Attempts, IsCustom) VALUES (?, ?, ?, ?)",
          [
            messageId,
            message.content.custom ? message.content.custom : (await this.getTodaysWord()),
            JSON.stringify(attempts),
            !!custom,
          ]
        );

        return {
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.SCORE,
            content: {
              id: messageId.toString(),
              answer: (await this.getTodaysWord()) ?? "",
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
        await this.pool.query(
          "INSERT INTO TextContent (ID, Text, ImageData, ReplyID) VALUES (?, ?, ?, ?)",
          [
            messageId,
            text,
            imageData || null,
            replyId ? parseInt(replyId) : null,
          ]
        );

        return {
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.MAIL_ALL,
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
        throw new Error("Unsupported message type");
    }
  }

  private mapMessageType(
    clientType: Client.MessageType
  ): string {
    switch (clientType) {
      case Client.MessageType.SCORE_TO_CHAT:
        return "SCORE";
      case Client.MessageType.CHAT_MESSAGE:
      default:
        return "MAIL_ALL";
    }
  }

  async toggleMessage(
    messageId: number,
    user: Server.PrivateUser
  ): Promise<boolean> {
    const message = await this.getMessageById(messageId);
    if (!message) return false;

    if (
      user.moderatorLevel < message.content.deleted &&
      message.content.user.name === user.name
    )
      return false;

    const newDeletedStatus = message.content.deleted ? 0 : user.moderatorLevel;

    const [result] = await this.pool.query<ResultSetHeader>(
      "UPDATE Message SET Deleted = ? WHERE ID = ?",
      [newDeletedStatus, messageId]
    );
    return result.affectedRows > 0;
  }

  async getLastMessageTimestamp(): Promise<string | null> {
    const [results] = await this.pool.query<RowDataPacket[]>(
      "SELECT Timestamp FROM Message ORDER BY Timestamp DESC LIMIT 1"
    );
    return results.length ? (results[0] as { Timestamp: string }).Timestamp : null;
  }

  async getPlayerBySessionHash(hash: string): Promise<Player | null> {
    const [results] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM Player WHERE SessionHash = ?",
      [hash]
    );
    return results.length ? this.mapPlayer(results[0] as PlayerRow) : null;
  }

  async getPlayerByName(username: string): Promise<Player | null> {
    const [results] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM Player WHERE Username = ?",
      [username]
    );
    return results.length ? this.mapPlayer(results[0] as PlayerRow) : null;
  }

  private mapPlayer(row: PlayerRow): Player {
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
      throw new Error("Oups, pseudo déjà pris.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.pool.query(
      "INSERT INTO Player (Username, Password) VALUES (?, ?)",
      [username, hashedPassword]
    );
  }

  async loginPlayer(username: string, password: string): Promise<Player> {
    const player = await this.getPlayerByName(username);
    if (!player) {
      throw new Error("Utilisateur inconnu au bataillon...");
    }

    const match = await bcrypt.compare(password, player.password);
    if (!match) {
      throw new Error("Mot de passe invalide !");
    }

    return player;
  }

  async storeSessionHash(playerId: number, sessionHash: string): Promise<void> {
    await this.pool.query("UPDATE Player SET SessionHash = ? WHERE ID = ?", [
      sessionHash,
      playerId,
    ]);
  }

  async getScoreDistribution(
    username: string
  ): Promise<{ [key: number]: number }> {
    const [results] = await this.pool.query<RowDataPacket[]>(
      `
      SELECT sc.Attempts
      FROM ScoreContent sc
      JOIN Message m ON sc.ID = m.ID
      JOIN Player p ON m.PlayerID = p.ID
      WHERE m.Type = 'SCORE' AND p.Username = ?
      GROUP BY DATE(m.Timestamp)
      HAVING MIN(m.Timestamp)
    `,
      [username]
    );

    return results.reduce((acc, row) => {
      const attempts = JSON.parse((row as ScoreContentRow).Attempts).length;
      acc[attempts] = (acc[attempts] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  }

  async getDailyScore(username: string): Promise<string[][]> {
    const [results] = await this.pool.query<RowDataPacket[]>(
      `
      SELECT sc.Attempts
      FROM ScoreContent sc
      JOIN Message m ON sc.ID = m.ID
      JOIN Player p ON m.PlayerID = p.ID
      WHERE m.Type = 'SCORE'
      AND p.Username = ?
      AND DATE(m.Timestamp) = CURDATE();
    `,
      [username]
    );

    return results.length > 0 ? JSON.parse((results[0] as ScoreContentRow).Attempts) : [];
  }
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  charset: process.env.DB_CHARSET,
};

const instance = new DatabaseService(dbConfig);
Object.freeze(instance);

export default instance;
