import { Client, Server } from '@surtom/interfaces';
import { worldRegistry, DEFAULT_WORLD_ID } from './worldRegistry.js';

const EPHEM_ID = 'ephem-test';
const SOLUTION = 'DIAMANT';

const DEFAULT_CHAT_OPTS = { includeDeleted: false, max: 200, showHelp: false };

const TEXT_MSG: Client.ChatMessage = {
  type: Client.MessageType.CHAT_MESSAGE,
  content: { text: 'hi' },
};

const PRIVATE_USER: Server.PrivateUser = {
  name: 'a',
  moderatorLevel: 0,
  isLoggedIn: false,
  isMobile: false,
  words: [],
  isBanned: false,
  xp: 0,
};

function spawnEphemeral() {
  return worldRegistry.addEphemeral({
    id: EPHEM_ID,
    displayName: 'Ephemeral test',
    language: 'fr',
    solution: SOLUTION,
    validWords: [SOLUTION],
  });
}

describe('worldRegistry', () => {
  beforeEach(() => {
    worldRegistry.resetForTests();
  });

  it('exposes only the default persistent world by default', () => {
    const ids = worldRegistry.list().map((w) => w.id);
    expect(ids).toEqual([DEFAULT_WORLD_ID]);

    const def = worldRegistry.get(DEFAULT_WORLD_ID);
    expect(def?.persistent).toBe(true);
    expect(def?.language).toBe('fr');
  });

  it('falls back to the default world for an unknown id', () => {
    expect(worldRegistry.getOrDefault('does-not-exist').id).toBe(DEFAULT_WORLD_ID);
  });

  it('registers an ephemeral world via addEphemeral', async () => {
    const w = spawnEphemeral();
    expect(w.persistent).toBe(false);
    const game = await w.getGameState();
    expect(game.solution).toBe(SOLUTION);
    expect(worldRegistry.get(EPHEM_ID)).toBe(w);
  });

  it('rejects duplicate ephemeral ids', () => {
    spawnEphemeral();
    expect(() => spawnEphemeral()).toThrow();
  });

  it('keeps chat / tries / scores in-memory and isolated per world', async () => {
    const w = spawnEphemeral();

    await w.saveMessage(PRIVATE_USER, TEXT_MSG);
    const chat = await w.getChat(DEFAULT_CHAT_OPTS);
    expect(chat).toHaveLength(1);
    expect(chat[0].type).toBe(Server.MessageType.TEXT);

    await w.recordTry('alice', ['D', 'I', 'A', 'M', 'A', 'N', 'T'], true);
    const tries = await w.getTries('alice');
    expect(tries.win).toBe(true);

    await w.markScoreShared('alice');
    expect(await w.hasSharedScore('alice')).toBe(true);
    expect(await w.hasSharedScore('bob')).toBe(false);
  });

  it('supports membership tracking', () => {
    const def = worldRegistry.get(DEFAULT_WORLD_ID)!;
    def.addMember('u1');
    def.addMember('u2');
    expect(def.members().sort()).toEqual(['u1', 'u2']);
    def.removeMember('u1');
    expect(def.members()).toEqual(['u2']);
  });

  it('toggles deletion on an in-memory chat message', async () => {
    const w = spawnEphemeral();
    await w.saveMessage(PRIVATE_USER, TEXT_MSG);
    const ok = await w.toggleMessageDeleted(1, { ...PRIVATE_USER, moderatorLevel: 2 });
    expect(ok).toBe(true);
    const chat = await w.getChat(DEFAULT_CHAT_OPTS);
    expect(chat[0].content.deleted).toBe(2);

    await w.toggleMessageDeleted(1, { ...PRIVATE_USER, moderatorLevel: 2 });
    const chat2 = await w.getChat(DEFAULT_CHAT_OPTS);
    expect(chat2[0].content.deleted).toBe(0);
  });

  it('removes an ephemeral world via removeEphemeral', () => {
    spawnEphemeral();
    expect(worldRegistry.get(EPHEM_ID)).toBeDefined();
    worldRegistry.removeEphemeral(EPHEM_ID);
    expect(worldRegistry.get(EPHEM_ID)).toBeUndefined();
  });

  it('refuses to remove the persistent default world', () => {
    worldRegistry.removeEphemeral(DEFAULT_WORLD_ID);
    expect(worldRegistry.get(DEFAULT_WORLD_ID)).toBeDefined();
  });
});
