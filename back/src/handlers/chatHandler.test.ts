import { Client, Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';

jest.mock('../repositories/messageRepository.js', () => ({
  __esModule: true,
  saveMessage: jest.fn(),
}));
jest.mock('../repositories/scoreRepository.js', () => ({
  __esModule: true,
  getDailyScore: jest.fn(),
}));
jest.mock('../repositories/wordRepository.js', () => ({
  __esModule: true,
  getOrCreateTodaysWord: jest.fn(),
  getTodaysWordAndHistoryId: jest.fn(),
  getValidWords: jest.fn(),
}));
jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
}));
jest.mock('../ws/broadcast.js', () => ({
  __esModule: true,
  broadcastToWorld: jest.fn(),
}));
jest.mock('../utils/log.js', () => ({
  __esModule: true,
  logMessage: jest.fn(),
}));

import { saveMessage } from '../repositories/messageRepository.js';
import { getDailyScore } from '../repositories/scoreRepository.js';
import { getOrCreateTodaysWord, getTodaysWordAndHistoryId, getValidWords } from '../repositories/wordRepository.js';
import { sendError } from '../ws/send.js';
import { broadcastToWorld } from '../ws/broadcast.js';
import { worldRegistry } from '../state/worldRegistry.js';
import { handleChatMessage } from './chatHandler.js';

const EPHEM_ID = 'ephem-test';
const EPHEM_SOLUTION = 'DIAMANT';
const DEFAULT_CHAT_OPTS = { includeDeleted: false, max: 200, showHelp: false };

const fakeWs = {} as never;

const buildUser = (moderatorLevel = 0, worldId: string = 'fr') =>
  new FullUser(
    'id-1',
    {
      name: 'alice',
      moderatorLevel,
      isLoggedIn: true,
      isMobile: false,
      words: [],
      isBanned: false,
      xp: 0,
    },
    fakeWs,
    'ip',
    worldId,
  );

const buildSavedReply: Server.Message = {
  type: Server.MessageType.MESSAGE,
  content: {
    type: Server.MessageType.TEXT,
    content: {
      id: '1',
      user: { name: 'alice', moderatorLevel: 0 },
      text: 'hi',
      timestamp: 'now',
      deleted: 0,
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  worldRegistry.resetForTests();
  worldRegistry.addEphemeral({
    id: EPHEM_ID,
    displayName: 'Ephemeral test',
    language: 'fr',
    solution: EPHEM_SOLUTION,
    validWords: [EPHEM_SOLUTION],
  });
  (getOrCreateTodaysWord as jest.Mock).mockResolvedValue('grass');
  (getValidWords as jest.Mock).mockResolvedValue([]);
});

describe('handleChatMessage (CHAT_MESSAGE) — default world', () => {
  it('rejects an empty/whitespace text from non-moderators without persisting', async () => {
    const message: Client.ChatMessage = {
      type: Client.MessageType.CHAT_MESSAGE,
      content: { text: '   ' },
    };
    await handleChatMessage(buildUser(0), message);
    expect(saveMessage).not.toHaveBeenCalled();
  });

  it('rejects oversized image data even from moderators', async () => {
    const message: Client.ChatMessage = {
      type: Client.MessageType.CHAT_MESSAGE,
      content: { text: 'hi', imageData: 'x'.repeat(200 * 1024) },
    };
    await handleChatMessage(buildUser(2), message);
    expect(saveMessage).not.toHaveBeenCalled();
  });

  it('persists a valid chat message and broadcasts the saved reply scoped to the user world', async () => {
    (saveMessage as jest.Mock).mockResolvedValue(buildSavedReply);
    const message: Client.ChatMessage = {
      type: Client.MessageType.CHAT_MESSAGE,
      content: { text: 'hello' },
    };
    await handleChatMessage(buildUser(0, 'fr'), message);
    expect(saveMessage).toHaveBeenCalled();
    expect(broadcastToWorld).toHaveBeenCalledWith('fr', buildSavedReply);
  });
});

describe('handleChatMessage (CHAT_MESSAGE) — ephemeral in-memory world', () => {
  it('does not call saveMessage and pushes into the world chat', async () => {
    const message: Client.ChatMessage = {
      type: Client.MessageType.CHAT_MESSAGE,
      content: { text: 'hi-ephem' },
    };
    await handleChatMessage(buildUser(0, EPHEM_ID), message);
    expect(saveMessage).not.toHaveBeenCalled();

    const w = worldRegistry.get(EPHEM_ID)!;
    const chat = await w.getChat(DEFAULT_CHAT_OPTS);
    expect(chat).toHaveLength(1);
    expect((chat[0] as Server.ChatMessage.Text).content.deleted).toBe(0);

    expect(broadcastToWorld).toHaveBeenCalledTimes(1);
    const [worldId] = (broadcastToWorld as jest.Mock).mock.calls[0];
    expect(worldId).toBe(EPHEM_ID);
  });
});

describe('handleChatMessage (SCORE_TO_CHAT)', () => {
  it('rejects when the user has already shared today', async () => {
    (getDailyScore as jest.Mock).mockResolvedValue([['G', 'R', 'A', 'S', 'S']]);
    (getTodaysWordAndHistoryId as jest.Mock).mockResolvedValue({ wordHistoryId: 1, todaysWord: 'GRASS' });
    await handleChatMessage(buildUser(), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['G', 'R', 'A', 'S', 'S']] },
    } as unknown as Client.ChatMessage);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Vous avez déjà partagé votre score...');
    expect(saveMessage).not.toHaveBeenCalled();
  });

  it('rejects when more than 6 attempts are submitted', async () => {
    (getDailyScore as jest.Mock).mockResolvedValue([]);
    (getTodaysWordAndHistoryId as jest.Mock).mockResolvedValue({ wordHistoryId: 1, todaysWord: 'GRASS' });
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await handleChatMessage(buildUser(), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: Array.from({ length: 7 }, () => ['G', 'X', 'X', 'X', 'X']) },
    } as unknown as Client.ChatMessage);
    expect(saveMessage).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('rejects when no reference word can be found', async () => {
    (getDailyScore as jest.Mock).mockResolvedValue([]);
    (getTodaysWordAndHistoryId as jest.Mock).mockRejectedValue(new Error('no word'));
    (getOrCreateTodaysWord as jest.Mock).mockRejectedValue(new Error('no word'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await handleChatMessage(buildUser(), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['G', 'R', 'A', 'S', 'S']] },
    } as unknown as Client.ChatMessage);
    expect(saveMessage).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('rejects attempts not matching the first letter or length of the reference', async () => {
    (getDailyScore as jest.Mock).mockResolvedValue([]);
    (getTodaysWordAndHistoryId as jest.Mock).mockResolvedValue({ wordHistoryId: 1, todaysWord: 'GRASS' });
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await handleChatMessage(buildUser(), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['B', 'R', 'A', 'S', 'S']] },
    } as unknown as Client.ChatMessage);
    expect(saveMessage).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('persists and broadcasts a valid score, threading the wordHistoryId into the share check', async () => {
    (getDailyScore as jest.Mock).mockResolvedValue([]);
    (getTodaysWordAndHistoryId as jest.Mock).mockResolvedValue({ wordHistoryId: 42, todaysWord: 'GRASS' });
    (saveMessage as jest.Mock).mockResolvedValue(buildSavedReply);
    await handleChatMessage(buildUser(), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['G', 'R', 'A', 'S', 'S']] },
    } as unknown as Client.ChatMessage);
    expect(getDailyScore).toHaveBeenCalledWith('alice', 42);
    expect(saveMessage).toHaveBeenCalled();
    expect(broadcastToWorld).toHaveBeenCalledWith('fr', buildSavedReply);
  });

  it('honors a custom solution when provided', async () => {
    (getDailyScore as jest.Mock).mockResolvedValue([]);
    (getTodaysWordAndHistoryId as jest.Mock).mockResolvedValue({ wordHistoryId: 42, todaysWord: 'GRASS' });
    (saveMessage as jest.Mock).mockResolvedValue(buildSavedReply);
    await handleChatMessage(buildUser(), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { custom: 'BRICK', attempts: [['B', 'R', 'I', 'C', 'K']] },
    } as unknown as Client.ChatMessage);
    expect(broadcastToWorld).toHaveBeenCalled();
  });
});

describe('handleChatMessage (SCORE_TO_CHAT) — ephemeral in-memory world', () => {
  it('uses the world solution and avoids the DB', async () => {
    await handleChatMessage(buildUser(0, EPHEM_ID), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['D', 'I', 'A', 'M', 'A', 'N', 'T']] },
    } as unknown as Client.ChatMessage);
    expect(getDailyScore).not.toHaveBeenCalled();
    expect(getTodaysWordAndHistoryId).not.toHaveBeenCalled();
    expect(saveMessage).not.toHaveBeenCalled();
    expect(broadcastToWorld).toHaveBeenCalledTimes(1);
    const w = worldRegistry.get(EPHEM_ID)!;
    expect(await w.hasSharedScore('alice')).toBe(true);
    const chat = await w.getChat(DEFAULT_CHAT_OPTS);
    expect(chat).toHaveLength(1);
  });

  it('rejects a second score share from the same player in the same world', async () => {
    const w = worldRegistry.get(EPHEM_ID)!;
    await w.markScoreShared('alice');

    await handleChatMessage(buildUser(0, EPHEM_ID), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['D', 'I', 'A', 'M', 'A', 'N', 'T']] },
    } as unknown as Client.ChatMessage);

    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Vous avez déjà partagé votre score...');
    expect(broadcastToWorld).not.toHaveBeenCalled();
  });
});
