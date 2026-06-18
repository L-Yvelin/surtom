import { Client, Server } from '@surtom/interfaces';
import { ChatFetchOptions, DbWorldStore, GameState, MemoryWorldStore, WorldStore } from './worldStore.js';
import { listWorlds as listWorldsFromDb } from '../repositories/worldRepository.js';

export const DEFAULT_WORLD_ID = 'fr';
export const DEFAULT_LANGUAGE = 'fr';

export interface World {
  id: string;
  displayName: string;
  language: string;
  persistent: boolean;

  getGameState(): Promise<GameState>;
  getChat(opts: ChatFetchOptions): Promise<Server.ChatMessage.Type[]>;
  saveMessage(user: Server.PrivateUser, message: Client.ChatMessage, scoreSolution?: string): Promise<Server.Message>;
  toggleMessageDeleted(messageId: number, user: Server.PrivateUser): Promise<boolean>;
  getTries(playerName: string): Promise<{ attempts: string[][]; win: boolean }>;
  recordTry(playerName: string, attempt: string[], win: boolean): Promise<void>;
  hasSharedScore(playerName: string): Promise<boolean>;
  markScoreShared(playerName: string): Promise<void>;

  addMember(userId: string): void;
  removeMember(userId: string): void;
  hasMember(userId: string): boolean;
  members(): string[];
}

interface InternalWorld extends World {
  store: WorldStore;
  membership: Set<string>;
}

function createWorld(seed: { id: string; displayName: string; language: string; persistent: boolean; store: WorldStore }): InternalWorld {
  const membership = new Set<string>();
  const world: InternalWorld = {
    id: seed.id,
    displayName: seed.displayName,
    language: seed.language,
    persistent: seed.persistent,
    store: seed.store,
    membership,

    getGameState: () => seed.store.getGameState(),
    getChat: (opts) => seed.store.getChat(opts),
    saveMessage: (user, msg, scoreSolution) => seed.store.saveMessage(user, msg, scoreSolution),
    toggleMessageDeleted: (id, user) => seed.store.toggleMessageDeleted(id, user),
    getTries: (name) => seed.store.getTries(name),
    recordTry: (name, attempt, win) => seed.store.recordTry(name, attempt, win),
    hasSharedScore: (name) => seed.store.hasSharedScore(name),
    markScoreShared: (name) => seed.store.markScoreShared(name),

    addMember: (id) => void membership.add(id),
    removeMember: (id) => void membership.delete(id),
    hasMember: (id) => membership.has(id),
    members: () => Array.from(membership),
  };
  return world;
}

function buildDefaultWorlds(): Map<string, InternalWorld> {
  const map = new Map<string, InternalWorld>();
  map.set(
    DEFAULT_WORLD_ID,
    createWorld({
      id: DEFAULT_WORLD_ID,
      displayName: 'Français',
      language: DEFAULT_LANGUAGE,
      persistent: true,
      store: new DbWorldStore(DEFAULT_WORLD_ID, DEFAULT_LANGUAGE),
    }),
  );
  return map;
}

class WorldRegistry {
  private worlds = buildDefaultWorlds();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    const dbWorlds = await listWorldsFromDb();
    if (dbWorlds.length === 0) {
      this.initialized = true;
      return;
    }
    const ephemerals = Array.from(this.worlds.values()).filter((w) => !w.persistent);
    this.worlds = new Map();
    for (const row of dbWorlds) {
      this.worlds.set(
        row.id,
        createWorld({
          id: row.id,
          displayName: row.displayName,
          language: row.language,
          persistent: true,
          store: new DbWorldStore(row.id, row.language),
        }),
      );
    }
    for (const ephemeral of ephemerals) this.worlds.set(ephemeral.id, ephemeral);
    this.initialized = true;
  }

  list(): World[] {
    return Array.from(this.worlds.values());
  }

  get(id: string): World | undefined {
    return this.worlds.get(id);
  }

  getOrDefault(id: string | undefined): World {
    if (id && this.worlds.has(id)) return this.worlds.get(id) as World;
    return this.worlds.get(DEFAULT_WORLD_ID) as World;
  }

  setValidWords(id: string, validWords: string[]): void {
    const world = this.worlds.get(id);
    if (!world) return;
    if (world.store instanceof MemoryWorldStore) world.store.setValidWords(validWords);
  }

  addEphemeral(seed: { id: string; displayName: string; language: string; solution: string; validWords: string[] }): World {
    if (this.worlds.has(seed.id)) {
      throw new Error(`World ${seed.id} already exists`);
    }
    const store = new MemoryWorldStore(seed.id, seed.solution, seed.validWords);
    const world = createWorld({
      id: seed.id,
      displayName: seed.displayName,
      language: seed.language,
      persistent: false,
      store,
    });
    this.worlds.set(seed.id, world);
    return world;
  }

  removeEphemeral(id: string): void {
    const world = this.worlds.get(id);
    if (!world || world.persistent) return;
    this.worlds.delete(id);
  }

  resetForTests(): void {
    this.worlds = buildDefaultWorlds();
    this.initialized = false;
  }
}

export const worldRegistry = new WorldRegistry();
