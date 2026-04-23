import { Client, Server } from '@surtom/interfaces';

jest.mock('./pool.js', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));
jest.mock('./playerRepository.js', () => ({
  __esModule: true,
  getPlayerByName: jest.fn(),
}));
jest.mock('./wordRepository.js', () => ({
  __esModule: true,
  getTodaysWord: jest.fn(),
}));

import pool from './pool.js';
import { getPlayerByName } from './playerRepository.js';
import { getTodaysWord } from './wordRepository.js';
import { getHelpMessage, getLastMessageTimestamp, getMessageById, getMessages, saveMessage, toggleMessage } from './messageRepository.js';

const query = pool.query as unknown as jest.Mock;

const buildJoinRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  ID: 1,
  Username: 'alice',
  Timestamp: '2024-01-01T00:00:00.000Z',
  Type: 'TEXT',
  Text: 'hi',
  ImageData: null,
  ReplyID: null,
  Answer: null,
  Attempts: null,
  IsCustom: 0,
  IsAdmin: 0,
  Deleted: 0,
  ...overrides,
});

beforeEach(() => {
  query.mockReset();
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
    query.mockResolvedValueOnce([
      [buildJoinRow({ ID: 2, Timestamp: '2024-01-02T00:00:00.000Z' }), buildJoinRow({ ID: 1, Timestamp: '2024-01-01T00:00:00.000Z' })],
    ]);
    const msgs = await getMessages();
    expect(msgs.map((m) => m.content.id)).toEqual(['1', '2']);
  });

  it('prepends the help message when showHelp=true (becomes last after reverse)', async () => {
    query.mockResolvedValueOnce([[buildJoinRow()]]);
    const msgs = await getMessages(false, 200, true);
    expect(msgs[msgs.length - 1].content.user.name).toBe('System');
  });

  it('maps SCORE rows to a SCORE message', async () => {
    query.mockResolvedValueOnce([
      [
        buildJoinRow({
          Type: 'SCORE',
          Text: null,
          Answer: 'GRASS',
          Attempts: JSON.stringify([['G', 'R', 'A', 'S', 'S']]),
        }),
      ],
    ]);
    const [msg] = await getMessages();
    expect(msg.type).toBe(Server.MessageType.SCORE);
    expect((msg.content as Server.ChatMessage.Content.ScoreMessageContent).answer).toBe('GRASS');
  });
});

describe('getMessageById', () => {
  it('returns undefined when the message does not exist', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getMessageById(1)).toBeUndefined();
  });

  it('returns the mapped message when found', async () => {
    query.mockResolvedValueOnce([[buildJoinRow()]]);
    expect((await getMessageById(1))?.content.id).toBe('1');
  });
});

describe('getLastMessageTimestamp', () => {
  it('returns null when no message exists', async () => {
    query.mockResolvedValueOnce([[]]);
    expect(await getLastMessageTimestamp()).toBeNull();
  });

  it('returns the timestamp of the most recent message', async () => {
    query.mockResolvedValueOnce([[{ Timestamp: '2024-01-01T00:00:00.000Z' }]]);
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
    query.mockResolvedValueOnce([{ insertId: 42 }]).mockResolvedValueOnce([{}]);
    const out = await saveMessage(
      { name: 'a', moderatorLevel: 0, isLoggedIn: true, isMobile: false, words: [], isBanned: false, xp: 0 },
      { type: Client.MessageType.CHAT_MESSAGE, content: { text: 'hi', imageData: 'img', replyId: '5' } },
    );
    expect(query.mock.calls[1][0]).toMatch(/INSERT INTO TextContent/);
    expect(query.mock.calls[1][1]).toEqual([42, 'hi', 'img', 5]);
    expect(out.type).toBe(Server.MessageType.MESSAGE);
    expect((out.content as Server.ChatMessage.SavedType).type).toBe(Server.MessageType.TEXT);
  });
});

describe('saveMessage (SCORE_TO_CHAT)', () => {
  it('uses the daily word when no custom solution is provided', async () => {
    (getPlayerByName as jest.Mock).mockResolvedValue({ id: 1 });
    (getTodaysWord as jest.Mock).mockResolvedValue('GRASS');
    query.mockResolvedValueOnce([{ insertId: 5 }]).mockResolvedValueOnce([{}]);
    const out = await saveMessage({ name: 'a', moderatorLevel: 0, isLoggedIn: true, isMobile: false, words: [], isBanned: false, xp: 0 }, {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['G', 'R', 'A', 'S', 'S']] },
    } as unknown as Client.ChatMessage);
    expect(query.mock.calls[1][1][1]).toBe('GRASS');
    expect(getTodaysWord).toHaveBeenCalledTimes(1);
    expect((out.content as Server.ChatMessage.SavedType).type).toBe(Server.MessageType.SCORE);
  });

  it('uses the custom solution when provided', async () => {
    (getPlayerByName as jest.Mock).mockResolvedValue({ id: 1 });
    query.mockResolvedValueOnce([{ insertId: 5 }]).mockResolvedValueOnce([{}]);
    await saveMessage({ name: 'a', moderatorLevel: 0, isLoggedIn: true, isMobile: false, words: [], isBanned: false, xp: 0 }, {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { custom: 'BRICK', attempts: [['B', 'R', 'I', 'C', 'K']] },
    } as unknown as Client.ChatMessage);
    expect(query.mock.calls[1][1][1]).toBe('BRICK');
    expect(getTodaysWord).not.toHaveBeenCalled();
  });
});

describe('toggleMessage', () => {
  it('returns false when no message matches the id', async () => {
    query.mockResolvedValueOnce([[]]);
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
    query.mockResolvedValueOnce([[buildJoinRow({ ID: 1, Username: 'alice', Deleted: 2 })]]);
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
    query.mockResolvedValueOnce([[buildJoinRow({ Deleted: 0 })]]).mockResolvedValueOnce([{ affectedRows: 1 }]);
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
    expect(query.mock.calls[1][1]).toEqual([2, 1]);
  });

  it('un-deletes a previously deleted message', async () => {
    query.mockResolvedValueOnce([[buildJoinRow({ Deleted: 1 })]]).mockResolvedValueOnce([{ affectedRows: 1 }]);
    await toggleMessage(1, {
      name: 'mod',
      moderatorLevel: 2,
      isLoggedIn: true,
      isMobile: false,
      words: [],
      isBanned: false,
      xp: 0,
    });
    expect(query.mock.calls[1][1]).toEqual([0, 1]);
  });
});
