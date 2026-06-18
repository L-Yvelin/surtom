import { Client, Server } from '@surtom/interfaces';
import {
  getMessages as repoGetMessages,
  saveMessage as repoSaveMessage,
  toggleMessage as repoToggleMessage,
} from '../repositories/messageRepository.js';
import { getOrCreateTodaysWord, getTodaysWordAndHistoryId, getValidWords } from '../repositories/wordRepository.js';
import { getDailyScore } from '../repositories/scoreRepository.js';
import { getPlayerByName } from '../repositories/playerRepository.js';
import { getOrCreateTry, updateTry } from '../repositories/tryRepository.js';

export interface GameState {
  wordHistoryId: number | null;
  solution: string;
  validWords: string[];
}

export interface ChatFetchOptions {
  includeDeleted: boolean;
  max: number;
  showHelp: boolean;
}

export interface WorldStore {
  getGameState(): Promise<GameState>;

  getChat(opts: ChatFetchOptions): Promise<Server.ChatMessage.Type[]>;
  saveMessage(user: Server.PrivateUser, message: Client.ChatMessage, scoreSolution?: string): Promise<Server.Message>;
  toggleMessageDeleted(messageId: number, user: Server.PrivateUser): Promise<boolean>;

  getTries(playerName: string): Promise<{ attempts: string[][]; win: boolean }>;
  recordTry(playerName: string, attempt: string[], win: boolean): Promise<void>;

  hasSharedScore(playerName: string): Promise<boolean>;
  markScoreShared(playerName: string): Promise<void>;
}

export class DbWorldStore implements WorldStore {
  constructor(
    private readonly worldId: string,
    private readonly language: string,
  ) {}

  async getGameState(): Promise<GameState> {
    const solution = await getOrCreateTodaysWord(this.worldId, this.language);
    const upper = solution.toUpperCase();
    const { wordHistoryId } = await getTodaysWordAndHistoryId(this.worldId);
    const validWords = await getValidWords(upper, this.language);
    return {
      wordHistoryId,
      solution: upper,
      validWords: [...validWords.map((w) => w.toUpperCase()), upper],
    };
  }

  async getChat(opts: ChatFetchOptions): Promise<Server.ChatMessage.Type[]> {
    return repoGetMessages(this.worldId, opts.includeDeleted, opts.max, opts.showHelp);
  }

  async saveMessage(user: Server.PrivateUser, message: Client.ChatMessage): Promise<Server.Message> {
    return repoSaveMessage(user, message, this.worldId);
  }

  async toggleMessageDeleted(messageId: number, user: Server.PrivateUser): Promise<boolean> {
    return repoToggleMessage(messageId, user);
  }

  async getTries(playerName: string): Promise<{ attempts: string[][]; win: boolean }> {
    const player = await getPlayerByName(playerName);
    if (!player) return { attempts: [], win: false };
    const { wordHistoryId } = await getTodaysWordAndHistoryId(this.worldId);
    return getOrCreateTry(player.id, wordHistoryId);
  }

  async recordTry(playerName: string, attempt: string[], win: boolean): Promise<void> {
    const player = await getPlayerByName(playerName);
    if (!player) throw new Error('Utilisateur introuvable.');
    const { wordHistoryId } = await getTodaysWordAndHistoryId(this.worldId);
    const existing = await getOrCreateTry(player.id, wordHistoryId);
    const newAttempts = [...existing.attempts, attempt];
    const newWin = existing.win || win;
    await updateTry(player.id, wordHistoryId, newAttempts, newWin);
  }

  async hasSharedScore(playerName: string): Promise<boolean> {
    let wordHistoryId: number;
    try {
      ({ wordHistoryId } = await getTodaysWordAndHistoryId(this.worldId));
    } catch {
      return false;
    }
    const score = await getDailyScore(playerName, wordHistoryId);
    return score.length > 0;
  }

  async markScoreShared(_playerName: string): Promise<void> {
    // no-op: persistence happens inside saveMessage when a SCORE_TO_CHAT lands.
  }
}

export class MemoryWorldStore implements WorldStore {
  private chat: Server.ChatMessage.SavedType[] = [];
  private tries = new Map<string, { attempts: string[][]; win: boolean }>();
  private scores = new Set<string>();
  private nextChatId = 1;

  constructor(
    _worldId: string,
    private readonly fixedSolution: string,
    private fixedValidWords: string[],
  ) {}

  setValidWords(words: string[]): void {
    this.fixedValidWords = words;
  }

  async getGameState(): Promise<GameState> {
    const upper = this.fixedSolution.toUpperCase();
    return {
      wordHistoryId: null,
      solution: upper,
      validWords: [...this.fixedValidWords.map((w) => w.toUpperCase()), upper],
    };
  }

  async getChat(_opts: ChatFetchOptions): Promise<Server.ChatMessage.Type[]> {
    return [...this.chat];
  }

  async saveMessage(user: Server.PrivateUser, message: Client.ChatMessage, scoreSolution?: string): Promise<Server.Message> {
    const id = String(this.nextChatId++);
    const timestamp = new Date().toISOString();
    const baseUser = { name: user.name, moderatorLevel: user.moderatorLevel };

    if (message.type === Client.MessageType.SCORE_TO_CHAT) {
      const answer = (scoreSolution ?? this.fixedSolution).toUpperCase();
      const saved: Server.ChatMessage.SavedType = {
        type: Server.MessageType.SCORE,
        content: {
          id,
          answer,
          attempts: message.content.attempts,
          timestamp,
          user: baseUser,
          deleted: 0,
        },
      };
      this.chat.push(saved);
      this.scores.add(user.name);
      return { type: Server.MessageType.MESSAGE, content: saved };
    }

    const { text, imageData, replyId } = message.content;
    const saved: Server.ChatMessage.SavedType = {
      type: Server.MessageType.TEXT,
      content: {
        id,
        text,
        timestamp,
        user: baseUser,
        imageData,
        replyId,
        deleted: 0,
      },
    };
    this.chat.push(saved);
    return { type: Server.MessageType.MESSAGE, content: saved };
  }

  async toggleMessageDeleted(messageId: number, user: Server.PrivateUser): Promise<boolean> {
    const target = this.chat.find((m) => m.content.id === String(messageId));
    if (!target) return false;
    if (user.moderatorLevel < target.content.deleted && target.content.user.name === user.name) return false;
    target.content.deleted = target.content.deleted ? 0 : user.moderatorLevel;
    return true;
  }

  async getTries(playerName: string): Promise<{ attempts: string[][]; win: boolean }> {
    return this.tries.get(playerName) ?? { attempts: [], win: false };
  }

  async recordTry(playerName: string, attempt: string[], win: boolean): Promise<void> {
    const current = this.tries.get(playerName) ?? { attempts: [], win: false };
    this.tries.set(playerName, {
      attempts: [...current.attempts, attempt],
      win: current.win || win,
    });
  }

  async hasSharedScore(playerName: string): Promise<boolean> {
    return this.scores.has(playerName);
  }

  async markScoreShared(playerName: string): Promise<void> {
    this.scores.add(playerName);
  }
}
