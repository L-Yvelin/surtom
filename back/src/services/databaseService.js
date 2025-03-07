var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from "path";
import { createPool } from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
class DatabaseService {
    constructor(dbConfig) {
        if (!DatabaseService.instance) {
            this.pool = createPool(dbConfig);
            DatabaseService.instance = this;
        }
        return DatabaseService.instance;
    }
    getLastMessageId() {
        return __awaiter(this, void 0, void 0, function* () {
            const [results] = yield this.pool.query("SELECT ID FROM Messages ORDER BY Date DESC LIMIT 1");
            return results.length ? results[0].ID : null;
        });
    }
    getTodaysWord() {
        return __awaiter(this, void 0, void 0, function* () {
            const [results] = yield this.pool.query(`
      SELECT m.MotMinecraft
      FROM MotMinecraft m, WordHistory w
      WHERE DATE(w.AssignedDate) = CURDATE()
      AND w.WordID = m.ID
      ORDER BY w.AssignedDate DESC
      LIMIT 1;
    `);
            return results.length ? results[0].MotMinecraft : null;
        });
    }
    getMessages() {
        return __awaiter(this, arguments, void 0, function* (includeDeleted = false, max = 200, showHelp = false) {
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
            const [results] = yield this.pool.query(query, [...queryParams, max]);
            if (showHelp) {
                const helpMessage = this.getHelpMessage();
                results.unshift(helpMessage);
            }
            return this.mapScoreData(results).reverse();
        });
    }
    getHelpMessage() {
        return {
            Texte: '[{"text":"Faites ","color":"LemonChiffon"},{"text":"/help","color":"DarkKhaki","clickable":"toggleChat(\'\');toggleChat(\'/help\')"},{"text":" pour plus d\'information","color":"LemonChiffon"}]',
            Type: "enhancedMessage",
            Date: new Date().toISOString(),
        };
    }
    mapScoreData(results) {
        return results.map((row) => {
            if (row.Type === "score") {
                return Object.assign(Object.assign({}, row), { Texte: JSON.stringify({
                        couleurs: row.Couleurs ? JSON.parse(row.Couleurs) : [],
                        mots: row.Mots ? JSON.parse(row.Mots) : [],
                        attempts: row.Attempts || 0,
                    }) });
            }
            return row;
        });
    }
    saveMessage(pseudo_1, texte_1, moderator_1, type_1) {
        return __awaiter(this, arguments, void 0, function* (pseudo, texte, moderator, type, imageData = null, answerId) {
            const [result] = yield this.pool.query("INSERT INTO Messages (Pseudo, Texte, Moderator, Type, Reply) VALUES (?, ?, ?, ?, ?)", [pseudo, type !== "score" ? texte : "", moderator, type, answerId]);
            const messageId = result.insertId;
            if (type === "score") {
                yield this.saveScoreData(messageId, texte);
            }
            if (imageData) {
                yield this.pool.query("INSERT INTO MessageImages (MessageID, ImageData) VALUES (?, ?)", [messageId, imageData]);
            }
            return this.getMessageById(messageId);
        });
    }
    saveScoreData(messageId, texte) {
        return __awaiter(this, void 0, void 0, function* () {
            let couleurs = [];
            let motsData = [];
            let solution = yield this.getTodaysWord();
            let attempts = 0;
            try {
                const parsedTexte = JSON.parse(texte);
                couleurs = parsedTexte.couleurs || [];
                motsData = parsedTexte.mots || [];
                attempts = motsData.length || 0;
            }
            catch (parseErr) {
                console.error("Error parsing texte for ScoreData:", parseErr);
            }
            yield this.pool.query("INSERT INTO ScoreData (MessageID, Couleurs, Mots, Answer, Attempts) VALUES (?, ?, ?, ?, ?)", [
                messageId,
                JSON.stringify(couleurs),
                JSON.stringify(motsData),
                solution,
                attempts,
            ]);
        });
    }
    getMessageById(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield this.pool.query(`
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
    `, [messageId]);
            if (rows.length === 0) {
                return null;
            }
            const row = rows[0];
            return Object.assign(Object.assign({}, row), { Texte: row.Type === "score"
                    ? JSON.stringify({
                        couleurs: row.Couleurs ? JSON.parse(row.Couleurs) : [],
                        mots: row.Mots ? JSON.parse(row.Mots) : [],
                        attempts: row.Attempts || null,
                    })
                    : row.Texte });
        });
    }
    deleteMessage(messageId_1) {
        return __awaiter(this, arguments, void 0, function* (messageId, permissionLevel = 1) {
            const [result] = yield this.pool.query("UPDATE Messages SET Supprime = ? WHERE ID = ?", [permissionLevel, messageId]);
            return result.affectedRows > 0;
        });
    }
    getLastMessageTimestamp() {
        return __awaiter(this, void 0, void 0, function* () {
            const [results] = yield this.pool.query("SELECT Date FROM Messages ORDER BY Date DESC LIMIT 1");
            return results.length ? results[0].Date : null;
        });
    }
    getUserWithSessionHash(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const [results] = yield this.pool.query("SELECT * FROM Surtomien WHERE hashSession = ?", [hash]);
            return results.length ? results[0] : null;
        });
    }
    getUser(pseudo) {
        return __awaiter(this, void 0, void 0, function* () {
            const [results] = yield this.pool.query("SELECT * FROM Surtomien WHERE Pseudo = ?", [pseudo]);
            return results.length ? results[0] : null;
        });
    }
    registerUser(pseudo, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.getUser(pseudo);
            if (existingUser) {
                throw new Error("Oups, pseudo déjà pris.");
            }
            const hashedPassword = yield bcrypt.hash(password, 10);
            yield this.pool.query("INSERT INTO Surtomien (Pseudo, MotDePasse) VALUES (?, ?)", [pseudo, hashedPassword]);
        });
    }
    loginUser(pseudo, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUser(pseudo);
            if (!user) {
                throw new Error("Utilisateur inconnu au bataillon...");
            }
            const match = yield bcrypt.compare(password, user.MotDePasse);
            if (!match) {
                throw new Error("Mot de passe invalide !");
            }
            return user;
        });
    }
    storeSessionHash(pseudo, sessionHash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query("UPDATE Surtomien SET hashSession = ? WHERE Pseudo = ?", [sessionHash, pseudo]);
        });
    }
    getScoreDistribution(pseudo) {
        return __awaiter(this, void 0, void 0, function* () {
            const [results] = yield this.pool.query(`
      SELECT sd.Attempts
      FROM ScoreData sd
      JOIN Messages m ON sd.MessageID = m.ID
      WHERE m.Type = 'score' AND m.Pseudo = ?
      GROUP BY DATE(m.Date)
      HAVING MIN(m.Date)
    `, [pseudo]);
            return results.reduce((acc, row) => {
                const attempts = row.Attempts || 0;
                if (!acc[attempts]) {
                    acc[attempts] = 1;
                }
                else {
                    acc[attempts]++;
                }
                return acc;
            }, {});
        });
    }
    getDailyScore(pseudo) {
        return __awaiter(this, void 0, void 0, function* () {
            const [results] = yield this.pool.query(`
      SELECT
      m.Texte,
      sd.Mots
      FROM Messages m
      LEFT JOIN ScoreData sd ON m.ID = sd.MessageID
      WHERE m.Type = 'score'
      AND m.Pseudo = ?
      AND DATE(m.Date) = CURDATE();
    `, [pseudo]);
            if (results.length > 0) {
                const row = results[0];
                try {
                    if (row.Mots) {
                        return JSON.parse(row.Mots);
                    }
                }
                catch (parseErr) {
                    console.error("Error parsing Mots from database:", parseErr);
                }
            }
            return [];
        });
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
