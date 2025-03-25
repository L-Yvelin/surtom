import path from "path";
import { createPool, Pool } from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export interface User {
  Pseudo: string;
  MotDePasse: string;
  Admin: number;
  HashSession?: string;
  banned?: number;
}

interface Message {
  ID: number;
  Pseudo: string;
  Texte: string;
  Moderator: boolean;
  Type: string;
  Reply?: number;
  Date: string;
  Supprime?: number;
  Couleurs?: string;
  Mots?: string;
  Answer?: string;
  Attempts?: number;
  ImageData?: Buffer;
}

class DatabaseService {
  private pool!: Pool;
  private static instance: DatabaseService;

  constructor(dbConfig: any) {
    if (!DatabaseService.instance) {
      this.pool = createPool(dbConfig);
      DatabaseService.instance = this;
    }

    return DatabaseService.instance;
  }

  async getLastMessageId(): Promise<number | null> {
    const [results]: [any[], any] = await this.pool.query(
      "SELECT ID FROM Messages ORDER BY Date DESC LIMIT 1"
    );
    return results.length ? results[0].ID : null;
  }

  async getTodaysWord(): Promise<string | null> {
    const [results]: [any[], any] = await this.pool.query(`
      SELECT m.MotMinecraft
      FROM MotMinecraft m, WordHistory w
      WHERE DATE(w.AssignedDate) = CURDATE()
      AND w.WordID = m.ID
      ORDER BY w.AssignedDate DESC
      LIMIT 1;
    `);
    return results.length ? results[0].MotMinecraft : null;
  }

  async getMessages(
    includeDeleted = false,
    max = 200,
    showHelp = false
  ): Promise<Message[]> {
    const whereClause = includeDeleted ? "" : "WHERE m.Supprime != ?";
    const queryParams = includeDeleted ? [] : ["1"];
    const query = `
      SELECT
      m.*,
      sd.Couleurs,
      sd.Mots,
      sd.Answer,
      sd.Attempts,
      mi.ImageData
      FROM Messages m
      LEFT JOIN ScoreData sd ON m.ID = sd.MessageID
      LEFT JOIN MessageImages mi ON m.ID = mi.MessageID
      ${whereClause}
      ORDER BY m.Date DESC
      LIMIT ?;
    `;

    const [results] = await this.pool.query(query, [...queryParams, max]);

    if (showHelp) {
      const helpMessage = this.getHelpMessage();
      (results as any[]).unshift(helpMessage);
    }

    return this.mapScoreData(results as any[]).reverse();
  }

  getHelpMessage(): Message {
    return {
      Texte:
        '[{"text":"Faites ","color":"LemonChiffon"},{"text":"/help","color":"DarkKhaki","clickable":"toggleChat(\'\');toggleChat(\'/help\')"},{"text":" pour plus d\'information","color":"LemonChiffon"}]',
      Type: "enhancedMessage",
      Date: new Date().toISOString(),
    } as Message;
  }

  mapScoreData(results: any[]): Message[] {
    return results.map((row) => {
      if (row.Type === "score") {
        return {
          ...row,
          Texte: JSON.stringify({
            couleurs: row.Couleurs ? JSON.parse(row.Couleurs) : [],
            mots: row.Mots ? JSON.parse(row.Mots) : [],
            attempts: row.Attempts || 0,
          }),
        };
      }
      return row;
    });
  }

  async saveMessage(
    pseudo: string,
    texte: string,
    moderator: boolean,
    type: string,
    imageData: Buffer | null = null,
    answerId?: number
  ): Promise<Message | null> {
    const [result] = await this.pool.query(
      "INSERT INTO Messages (Pseudo, Texte, Moderator, Type, Reply) VALUES (?, ?, ?, ?, ?)",
      [pseudo, type !== "score" ? texte : "", moderator, type, answerId]
    );

    const messageId = (result as any).insertId;

    if (type === "score") {
      await this.saveScoreData(messageId, texte);
    }

    if (imageData) {
      await this.pool.query(
        "INSERT INTO MessageImages (MessageID, ImageData) VALUES (?, ?)",
        [messageId, imageData]
      );
    }

    return this.getMessageById(messageId);
  }

  async saveScoreData(messageId: number, texte: string): Promise<void> {
    let couleurs: any[] = [];
    let motsData: any[] = [];
    let solution = await this.getTodaysWord();
    let attempts = 0;

    try {
      const parsedTexte = JSON.parse(texte);
      couleurs = parsedTexte.couleurs || [];
      motsData = parsedTexte.mots || [];
      attempts = motsData.length || 0;
    } catch (parseErr) {
      console.error("Error parsing texte for ScoreData:", parseErr);
    }

    await this.pool.query(
      "INSERT INTO ScoreData (MessageID, Couleurs, Mots, Answer, Attempts) VALUES (?, ?, ?, ?, ?)",
      [
        messageId,
        JSON.stringify(couleurs),
        JSON.stringify(motsData),
        solution,
        attempts,
      ]
    );
  }

  async getMessageById(messageId: number): Promise<Message | null> {
    const [rows]: [any[], any] = await this.pool.query(
      `
      SELECT
      m.*,
      sd.Couleurs,
      sd.Mots,
      sd.Answer,
      sd.Attempts,
      mi.ImageData
      FROM Messages m
      LEFT JOIN ScoreData sd ON m.ID = sd.MessageID
      LEFT JOIN MessageImages mi ON m.ID = mi.MessageID
      WHERE m.ID = ?;
    `,
      [messageId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      ...row,
      Texte:
        row.Type === "score"
          ? JSON.stringify({
              couleurs: row.Couleurs ? JSON.parse(row.Couleurs) : [],
              mots: row.Mots ? JSON.parse(row.Mots) : [],
              attempts: row.Attempts || null,
            })
          : row.Texte,
    };
  }

  async deleteMessage(
    messageId: number,
    permissionLevel = 1
  ): Promise<boolean> {
    const [result]: [any[], any] = await this.pool.query(
      "UPDATE Messages SET Supprime = ? WHERE ID = ?",
      [permissionLevel, messageId]
    );
    return (result as any).affectedRows > 0;
  }

  async getLastMessageTimestamp(): Promise<string | null> {
    const [results]: [any[], any] = await this.pool.query(
      "SELECT Date FROM Messages ORDER BY Date DESC LIMIT 1"
    );
    return results.length ? results[0].Date : null;
  }

  async getUserWithSessionHash(hash: string): Promise<User | null> {
    const [results]: [any[], any] = await this.pool.query(
      "SELECT * FROM Surtomien WHERE hashSession = ?",
      [hash]
    );
    return results.length ? (results[0] as User) : null;
  }

  async getUser(pseudo: string): Promise<User | null> {
    const [results]: [any[], any] = await this.pool.query(
      "SELECT * FROM Surtomien WHERE Pseudo = ?",
      [pseudo]
    );
    return results.length ? results[0] : null;
  }

  async registerUser(pseudo: string, password: string): Promise<void> {
    const existingUser = await this.getUser(pseudo);
    if (existingUser) {
      throw new Error("Oups, pseudo déjà pris.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.pool.query(
      "INSERT INTO Surtomien (Pseudo, MotDePasse) VALUES (?, ?)",
      [pseudo, hashedPassword]
    );
  }

  async loginUser(pseudo: string, password: string): Promise<User> {
    const user = await this.getUser(pseudo);
    if (!user) {
      throw new Error("Utilisateur inconnu au bataillon...");
    }

    const match = await bcrypt.compare(password, user.MotDePasse);
    if (!match) {
      throw new Error("Mot de passe invalide !");
    }

    return user;
  }

  async storeSessionHash(pseudo: string, sessionHash: string): Promise<void> {
    await this.pool.query(
      "UPDATE Surtomien SET hashSession = ? WHERE Pseudo = ?",
      [sessionHash, pseudo]
    );
  }

  async getScoreDistribution(
    pseudo: string
  ): Promise<{ [key: number]: number }> {
    const [results]: [any[], any] = await this.pool.query(
      `
      SELECT sd.Attempts
      FROM ScoreData sd
      JOIN Messages m ON sd.MessageID = m.ID
      WHERE m.Type = 'score' AND m.Pseudo = ?
      GROUP BY DATE(m.Date)
      HAVING MIN(m.Date)
    `,
      [pseudo]
    );

    return results.reduce((acc, row) => {
      const attempts = row.Attempts || 0;
      if (!acc[attempts]) {
        acc[attempts] = 1;
      } else {
        acc[attempts]++;
      }
      return acc;
    }, {});
  }

  async getDailyScore(pseudo: string): Promise<string[]> {
    const [results]: [any[], any] = await this.pool.query(
      `
      SELECT
      m.Texte,
      sd.Mots
      FROM Messages m
      LEFT JOIN ScoreData sd ON m.ID = sd.MessageID
      WHERE m.Type = 'score'
      AND m.Pseudo = ?
      AND DATE(m.Date) = CURDATE();
    `,
      [pseudo]
    );

    if (results.length > 0) {
      const row = results[0];
      try {
        if (row.Mots) {
          return JSON.parse(row.Mots);
        }
      } catch (parseErr) {
        console.error("Error parsing Mots from database:", parseErr);
      }
    }

    return [];
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
