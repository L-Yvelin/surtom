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
  getTodaysWord: jest.fn(),
}));
jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
}));
jest.mock('../ws/broadcast.js', () => ({
  __esModule: true,
  broadcastAll: jest.fn(),
}));
jest.mock('../utils/log.js', () => ({
  __esModule: true,
  logMessage: jest.fn(),
}));

import { saveMessage } from '../repositories/messageRepository.js';
import { getDailyScore } from '../repositories/scoreRepository.js';
import { getTodaysWord } from '../repositories/wordRepository.js';
import { sendError } from '../ws/send.js';
import { broadcastAll } from '../ws/broadcast.js';
import { handleChatMessage } from './chatHandler.js';

const fakeWs = {} as never;

const buildUser = (moderatorLevel = 0) =>
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
});

describe('handleChatMessage (CHAT_MESSAGE)', () => {
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

  it('persists a valid chat message and broadcasts the saved reply', async () => {
    (saveMessage as jest.Mock).mockResolvedValue(buildSavedReply);
    const message: Client.ChatMessage = {
      type: Client.MessageType.CHAT_MESSAGE,
      content: { text: 'hello' },
    };
    await handleChatMessage(buildUser(0), message);
    expect(saveMessage).toHaveBeenCalled();
    expect(broadcastAll).toHaveBeenCalledWith(buildSavedReply);
  });
});

describe('handleChatMessage (SCORE_TO_CHAT)', () => {
  it('rejects when the user has already shared today', async () => {
    (getDailyScore as jest.Mock).mockResolvedValue([['G', 'R', 'A', 'S', 'S']]);
    await handleChatMessage(buildUser(), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['G', 'R', 'A', 'S', 'S']] },
    } as unknown as Client.ChatMessage);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Vous avez déjà partagé votre score...');
    expect(saveMessage).not.toHaveBeenCalled();
  });

  it('rejects when more than 6 attempts are submitted', async () => {
    (getDailyScore as jest.Mock).mockResolvedValue([]);
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
    (getTodaysWord as jest.Mock).mockResolvedValue(null);
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
    (getTodaysWord as jest.Mock).mockResolvedValue('GRASS');
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await handleChatMessage(buildUser(), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['B', 'R', 'A', 'S', 'S']] },
    } as unknown as Client.ChatMessage);
    expect(saveMessage).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('persists and broadcasts a valid score', async () => {
    (getDailyScore as jest.Mock).mockResolvedValue([]);
    (getTodaysWord as jest.Mock).mockResolvedValue('GRASS');
    (saveMessage as jest.Mock).mockResolvedValue(buildSavedReply);
    await handleChatMessage(buildUser(), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['G', 'R', 'A', 'S', 'S']] },
    } as unknown as Client.ChatMessage);
    expect(saveMessage).toHaveBeenCalled();
    expect(broadcastAll).toHaveBeenCalledWith(buildSavedReply);
  });

  it('honors a custom solution when provided', async () => {
    (getDailyScore as jest.Mock).mockResolvedValue([]);
    (saveMessage as jest.Mock).mockResolvedValue(buildSavedReply);
    await handleChatMessage(buildUser(), {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { custom: 'BRICK', attempts: [['B', 'R', 'I', 'C', 'K']] },
    } as unknown as Client.ChatMessage);
    expect(getTodaysWord).not.toHaveBeenCalled();
    expect(broadcastAll).toHaveBeenCalled();
  });
});
