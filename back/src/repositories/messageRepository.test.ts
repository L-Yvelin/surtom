import { Client, Server } from '@surtom/interfaces';
import { createMockDb } from '../db/testing.js';

const mock = createMockDb();
jest.mock('../db/client.js', () => ({
  __esModule: true,
  db: mock.db,
  schema: {},
}));

jest.mock('./playerRepository.js', () => ({
  __esModule: true,
  getPlayerByName: jest.fn(),
}));
jest.mock('./wordRepository.js', () => ({
  __esModule: true,
  getTodaysWord: jest.fn(),
}));

import { getPlayerByName } from './playerRepository.js';
import { getTodaysWord } from './wordRepository.js';
import { getHelpMessage, getLastMessageTimestamp, getMessageById, getMessages, saveMessage, toggleMessage } from './messageRepository.js';

const buildJoinRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  username: 'alice',
  timestamp: new Date('2024-01-01T00:00:00.000Z'),
  type: 'TEXT',
  text: 'hi',
  imageData: null,
  replyId: null,
  answer: null,
  attempts: null,
  isCustom: 0,
  isAdmin: 0,
  deleted: 0,
  ...overrides,
});

beforeEach(() => {
  mock.reset();
  (getPlayerByName as jest.Mock).mockReset();
  (getTodaysWord as jest.Mock).mockReset();
});

describe('getHelpMessage', () => {
  it('returns an ENHANCED System message', () => {
    const help = getHelpMessage();
    expect(help.type).toBe(Server.MessageType.ENHANCED);
    expect(help.content.user.name).toBe('System');
  });
});

describe('getMessages', () => {
  it('orders messages chronologically (reverses the DESC query)', async () => {
    mock.enqueue([
      buildJoinRow({ id: 2, timestamp: new Date('2024-01-02T00:00:00.000Z') }),
      buildJoinRow({ id: 1, timestamp: new Date('2024-01-01T00:00:00.000Z') }),
    ]);
    const msgs = await getMessages();
    expect(msgs.map((m) => m.content.id)).toEqual(['1', '2']);
  });

  it('prepends the help message when showHelp=true (becomes last after reverse)', async () => {
    mock.enqueue([buildJoinRow()]);
    const msgs = await getMessages('fr', false, 200, true);
    expect(msgs[msgs.length - 1].content.user.name).toBe('System');
  });

  it('threads worldId without throwing', async () => {
    mock.enqueue([buildJoinRow()]);
    await expect(getMessages('en')).resolves.toBeDefined();
  });

  it('maps SCORE rows to a SCORE message', async () => {
    mock.enqueue([
      buildJoinRow({
        type: 'SCORE',
        text: null,
        answer: 'GRASS',
        attempts: JSON.stringify([['G', 'R', 'A', 'S', 'S']]),
      }),
    ]);
    const [msg] = await getMessages();
    expect(msg.type).toBe(Server.MessageType.SCORE);
    expect((msg.content as Server.ChatMessage.Content.ScoreMessageContent).answer).toBe('GRASS');
  });
});

describe('getMessageById', () => {
  it('returns undefined when the message does not exist', async () => {
    mock.enqueue([]);
    expect(await getMessageById(1)).toBeUndefined();
  });

  it('returns the mapped message when found', async () => {
    mock.enqueue([buildJoinRow()]);
    expect((await getMessageById(1))?.content.id).toBe('1');
  });
});

describe('getLastMessageTimestamp', () => {
  it('returns null when no message exists', async () => {
    mock.enqueue([]);
    expect(await getLastMessageTimestamp()).toBeNull();
  });

  it('returns the ISO timestamp of the most recent message', async () => {
    mock.enqueue([{ timestamp: new Date('2024-01-01T00:00:00.000Z') }]);
    expect(await getLastMessageTimestamp()).toBe('2024-01-01T00:00:00.000Z');
  });
});

describe('saveMessage (CHAT_MESSAGE)', () => {
  it('throws when the player is not found', async () => {
    (getPlayerByName as jest.Mock).mockResolvedValue(undefined);
    await expect(
      saveMessage(
        { name: 'a', moderatorLevel: 0, isLoggedIn: true, isMobile: false, words: [], isBanned: false, xp: 0 },
        { type: Client.MessageType.CHAT_MESSAGE, content: { text: 'hi' } },
      ),
    ).rejects.toThrow('Player not found');
  });

  it('inserts the message + text content and returns a TEXT envelope', async () => {
    (getPlayerByName as jest.Mock).mockResolvedValue({ id: 7 });
    mock.enqueue([{ insertId: 42 }, []], [{ affectedRows: 1 }, []]);
    const out = await saveMessage(
      { name: 'a', moderatorLevel: 0, isLoggedIn: true, isMobile: false, words: [], isBanned: false, xp: 0 },
      { type: Client.MessageType.CHAT_MESSAGE, content: { text: 'hi', imageData: 'img', replyId: '5' } },
    );
    expect(out.type).toBe(Server.MessageType.MESSAGE);
    expect((out.content as Server.ChatMessage.SavedType).type).toBe(Server.MessageType.TEXT);
  });
});

describe('saveMessage (SCORE_TO_CHAT)', () => {
  it('uses the daily word when no custom solution is provided', async () => {
    (getPlayerByName as jest.Mock).mockResolvedValue({ id: 1 });
    (getTodaysWord as jest.Mock).mockResolvedValue('GRASS');
    mock.enqueue([{ insertId: 5 }, []], [{ id: 11 }], [{ affectedRows: 1 }, []]);
    const out = await saveMessage({ name: 'a', moderatorLevel: 0, isLoggedIn: true, isMobile: false, words: [], isBanned: false, xp: 0 }, {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['G', 'R', 'A', 'S', 'S']] },
    } as unknown as Client.ChatMessage);
    expect(getTodaysWord).toHaveBeenCalledTimes(1);
    expect((out.content as Server.ChatMessage.SavedType).type).toBe(Server.MessageType.SCORE);
  });

  it('uses the custom solution when provided', async () => {
    (getPlayerByName as jest.Mock).mockResolvedValue({ id: 1 });
    mock.enqueue([{ insertId: 5 }, []], [{ id: 11 }], [{ affectedRows: 1 }, []]);
    await saveMessage({ name: 'a', moderatorLevel: 0, isLoggedIn: true, isMobile: false, words: [], isBanned: false, xp: 0 }, {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { custom: 'BRICK', attempts: [['B', 'R', 'I', 'C', 'K']] },
    } as unknown as Client.ChatMessage);
    expect(getTodaysWord).not.toHaveBeenCalled();
  });

  it('does not throw when no daily history row exists for the world', async () => {
    (getPlayerByName as jest.Mock).mockResolvedValue({ id: 1 });
    (getTodaysWord as jest.Mock).mockResolvedValue('GRASS');
    mock.enqueue([{ insertId: 5 }, []], [], [{ affectedRows: 1 }, []]);
    await expect(
      saveMessage({ name: 'a', moderatorLevel: 0, isLoggedIn: true, isMobile: false, words: [], isBanned: false, xp: 0 }, {
        type: Client.MessageType.SCORE_TO_CHAT,
        content: { attempts: [['G', 'R', 'A', 'S', 'S']] },
      } as unknown as Client.ChatMessage),
    ).resolves.toBeDefined();
  });
});

describe('toggleMessage', () => {
  it('returns false when no message matches the id', async () => {
    mock.enqueue([]);
    const result = await toggleMessage(99, {
      name: 'a',
      moderatorLevel: 1,
      isLoggedIn: true,
      isMobile: false,
      words: [],
      isBanned: false,
      xp: 0,
    });
    expect(result).toBe(false);
  });

  it('refuses self-undelete when moderatorLevel is below the recorded delete level', async () => {
    mock.enqueue([buildJoinRow({ id: 1, username: 'alice', deleted: 2 })]);
    const result = await toggleMessage(1, {
      name: 'alice',
      moderatorLevel: 1,
      isLoggedIn: true,
      isMobile: false,
      words: [],
      isBanned: false,
      xp: 0,
    });
    expect(result).toBe(false);
  });

  it('marks a non-deleted message as deleted and returns true', async () => {
    mock.enqueue([buildJoinRow({ deleted: 0 })], [{ affectedRows: 1 }, []]);
    const result = await toggleMessage(1, {
      name: 'mod',
      moderatorLevel: 2,
      isLoggedIn: true,
      isMobile: false,
      words: [],
      isBanned: false,
      xp: 0,
    });
    expect(result).toBe(true);
  });

  it('un-deletes a previously deleted message', async () => {
    mock.enqueue([buildJoinRow({ deleted: 1 })], [{ affectedRows: 1 }, []]);
    const result = await toggleMessage(1, {
      name: 'mod',
      moderatorLevel: 2,
      isLoggedIn: true,
      isMobile: false,
      words: [],
      isBanned: false,
      xp: 0,
    });
    expect(result).toBe(true);
  });
});
