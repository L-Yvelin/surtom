import WS from 'ws';
import { jest } from '@jest/globals';
import * as helpers from '../src/utils/helpers';
import * as commandHandler from '../src/handlers/commandHandler';
import * as databaseService from '../src/services/databaseService';
import * as constants from '../src/utils/constants';
import * as storeModule from '../src/store';
import FullUser from '../src/models/User';
import { Server as ServerNS } from '@surtom/interfaces/Message.js';

// Use require to access unexported functions for testing
const serverModule = require('../src/server');
const { initializeConnection, updateUsersList } = serverModule;

jest.mock('../src/services/databaseService', () => ({
  __esModule: true,
  default: {
    getMessages: jest.fn(),
    getTodaysWord: jest.fn(),
    getValidWords: jest.fn(),
    saveMessage: jest.fn(),
    getPlayerBySessionHash: jest.fn(),
    getScoreDistribution: jest.fn(),
    toggleMessage: jest.fn(),
  },
}));
const mockedDatabaseService = require('../src/services/databaseService').default;

describe('server.ts', () => {
  // Mocks and setup will go here
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests for each function will go here
});

describe('initializeConnection', () => {
  let user: FullUser;
  let mockSend: jest.MockedFunction<any>;

  beforeEach(() => {
    mockSend = jest.fn();
    user = new FullUser(
      'id',
      {
        name: 'TestUser',
        moderatorLevel: 1,
        isLoggedIn: true,
        isMobile: false,
        words: [],
        isBanned: false,
        xp: 0,
      },
      { send: mockSend } as unknown as WS,
      '127.0.0.1',
    );
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(serverModule, 'updateUsersList').mockImplementation(() => {});
    mockedDatabaseService.getMessages.mockResolvedValue([
      { type: ServerNS.MessageType.TEXT },
      { type: ServerNS.MessageType.ENHANCED },
      { type: ServerNS.MessageType.SCORE },
      { type: 'OTHER' },
    ]);
    mockedDatabaseService.getTodaysWord.mockResolvedValue('WORD');
    mockedDatabaseService.getValidWords.mockResolvedValue(['WORD1', 'WORD2']);
    jest.spyOn(constants, 'default', 'get').mockReturnValue({ MAX_MESSAGES_LOADED: 100, funnyNames: ['a', 'b'] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call updateUsersList and log new connection', async () => {
    await initializeConnection(user);
    expect(serverModule.updateUsersList).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('New connection:'));
  });

  it('should send filtered messages to user', async () => {
    await initializeConnection(user);
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('GET_MESSAGES'));
    // Only TEXT, ENHANCED, SCORE types should be sent
    const sent = JSON.parse(mockSend.mock.calls[0][0]);
    expect(sent.content.length).toBe(3);
  });

  it('should send daily words to user', async () => {
    await initializeConnection(user);
    // The last call should be for DAILY_WORDS
    const sent = JSON.parse(mockSend.mock.calls[mockSend.mock.calls.length - 1][0]);
    expect(sent.type).toBe('DAILY_WORDS');
    expect(sent.content).toContain('WORD');
    expect(sent.content).toContain('WORD1');
    expect(sent.content).toContain('WORD2');
  });

  it('should log error if getMessages throws', async () => {
    mockedDatabaseService.getMessages.mockRejectedValueOnce(new Error('fail'));
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await initializeConnection(user);
    expect(mockError).toHaveBeenCalledWith('Error getting last message timestamp:', expect.any(Error));
  });

  it('should log error if no word found for today', async () => {
    mockedDatabaseService.getTodaysWord.mockResolvedValueOnce(null);
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await initializeConnection(user);
    expect(mockError).toHaveBeenCalledWith('No word found for today');
  });
});

describe('logMessage', () => {
  let user: FullUser;
  let mockFetch: jest.Mock;
  beforeEach(() => {
    user = new FullUser(
      'id',
      {
        name: 'TestUser',
        moderatorLevel: 1,
        isLoggedIn: true,
        isMobile: false,
        words: [],
        isBanned: false,
        xp: 0,
      },
      { send: jest.fn() } as unknown as WS,
      '127.0.0.1',
    );
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockFetch = jest.fn();
    global.fetch = mockFetch as unknown as typeof global.fetch;
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should log and call fetch with correct params', () => {
    const { logMessage } = serverModule;
    logMessage('hello', user);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('<TestUser> hello'));
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('ntfy.sh/surtom3630'),
      expect.objectContaining({
        method: 'PUT',
        body: '<TestUser> hello',
        headers: expect.objectContaining({ Title: 'SURTOM' }),
      }),
    );
  });
});

describe('handleMessage', () => {
  let user: FullUser;
  let mockSend: jest.Mock;
  let mockHandleCommand: jest.Mock;
  let mockHandleChatMessage: jest.Mock;
  let mockHandleDeleteMessage: jest.Mock;
  let mockSendMessagesAll: jest.Mock;
  let mockHandleCustomMessageType: jest.Mock;
  beforeEach(() => {
    mockSend = jest.fn();
    user = new FullUser(
      'id',
      {
        name: 'TestUser',
        moderatorLevel: 0,
        isLoggedIn: true,
        isMobile: false,
        words: [],
        isBanned: false,
        xp: 0,
      },
      { send: mockSend } as unknown as WS,
      '127.0.0.1',
    );
    mockHandleCommand = jest.spyOn(require('../src/handlers/commandHandler'), 'handleCommand').mockImplementation(() => {}) as jest.Mock;
    mockHandleChatMessage = jest.spyOn(serverModule, 'handleChatMessage').mockResolvedValue(undefined) as jest.Mock;
    mockHandleDeleteMessage = jest.spyOn(serverModule, 'handleDeleteMessage').mockResolvedValue(undefined) as jest.Mock;
    mockSendMessagesAll = jest.spyOn(serverModule, 'sendMessagesAll').mockImplementation(() => {}) as jest.Mock;
    mockHandleCustomMessageType = jest.spyOn(serverModule, 'handleCustomMessageType').mockImplementation(() => {}) as jest.Mock;
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should return on PING', async () => {
    const { handleMessage } = serverModule;
    await expect(handleMessage(user, { type: 'ping' })).resolves.toBeUndefined();
    expect(mockHandleCommand).not.toHaveBeenCalled();
  });
  it('should handle command if message starts with /', async () => {
    const { handleMessage } = serverModule;
    await handleMessage(user, {
      type: 'chatMessage',
      content: { text: '/cmd' },
    });
    expect(mockHandleCommand).toHaveBeenCalledWith(user, 'cmd');
  });
  it('should apply cooldown and not call handleChatMessage if rate limited', async () => {
    const { handleMessage } = serverModule;
    user.messageCount = 6;
    user.lastMessageTimestamp = new Date().toISOString();
    user.messageCooldown = 1;
    user.cooldownMultiplier = 2;
    jest.spyOn(Date, 'now').mockReturnValue(Date.now());
    await handleMessage(user, { type: 'chatMessage', content: { text: 'hi' } });
    expect(mockHandleChatMessage).not.toHaveBeenCalled();
  });
  it('should reset cooldown if enough time passed', async () => {
    const { handleMessage } = serverModule;
    user.messageCount = 6;
    user.lastMessageTimestamp = new Date(Date.now() - 2000).toISOString();
    user.messageCooldown = 1;
    user.cooldownMultiplier = 2;
    await handleMessage(user, { type: 'chatMessage', content: { text: 'hi' } });
    expect(mockHandleChatMessage).toHaveBeenCalled();
    expect(user.messageCooldown).toBe(1);
  });
  it('should call handleChatMessage for chatMessage', async () => {
    const { handleMessage } = serverModule;
    await handleMessage(user, { type: 'chatMessage', content: { text: 'hi' } });
    expect(mockHandleChatMessage).toHaveBeenCalled();
  });
  it('should call handleChatMessage for scoreToChat', async () => {
    const { handleMessage } = serverModule;
    await handleMessage(user, {
      type: 'scoreToChat',
      content: { attempts: [['a']] },
    });
    expect(mockHandleChatMessage).toHaveBeenCalled();
  });
  it('should call handleDeleteMessage for deleteMessage', async () => {
    const { handleMessage } = serverModule;
    await handleMessage(user, { type: 'deleteMessage', content: 1 });
    expect(mockHandleDeleteMessage).toHaveBeenCalled();
  });
  it('should call sendMessagesAll for isTyping', async () => {
    const { handleMessage } = serverModule;
    await handleMessage(user, { type: 'isTyping' });
    expect(mockSendMessagesAll).toHaveBeenCalledWith({
      type: expect.any(String),
      content: user.privateUser.name,
    });
  });
  it('should call handleCustomMessageType for unknown type', async () => {
    const { handleMessage } = serverModule;
    await handleMessage(user, { type: 'unknownType', content: {} });
    expect(mockHandleCustomMessageType).toHaveBeenCalled();
  });
});

describe('handleChatMessage', () => {
  let user: FullUser;
  let mockHandleScoreToChat: jest.Mock;
  let mockHandleMailAll: jest.Mock;
  beforeEach(() => {
    user = new FullUser(
      'id',
      {
        name: 'TestUser',
        moderatorLevel: 0,
        isLoggedIn: true,
        isMobile: false,
        words: [],
        isBanned: false,
        xp: 0,
      },
      { send: jest.fn() } as unknown as WS,
      '127.0.0.1',
    );
    mockHandleScoreToChat = jest.spyOn(serverModule, 'handleScoreToChat').mockResolvedValue(undefined) as jest.Mock;
    mockHandleMailAll = jest.spyOn(serverModule, 'handleMailAll').mockResolvedValue(undefined) as jest.Mock;
    jest.spyOn(require('../src/utils/helpers'), 'validateText').mockReturnValue(true);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should call handleScoreToChat for SCORE_TO_CHAT', async () => {
    const { handleChatMessage } = serverModule;
    await handleChatMessage(user, {
      type: 'scoreToChat',
      content: { attempts: [['a']] },
    });
    expect(mockHandleScoreToChat).toHaveBeenCalled();
  });
  it('should not call handleMailAll if not moderator and text invalid', async () => {
    jest.spyOn(require('../src/utils/helpers'), 'validateText').mockReturnValue(false);
    const { handleChatMessage } = serverModule;
    await handleChatMessage(user, {
      type: 'chatMessage',
      content: { text: 'bad' },
    });
    expect(mockHandleMailAll).not.toHaveBeenCalled();
  });
  it('should not call handleMailAll if imageData too large', async () => {
    const { handleChatMessage } = serverModule;
    await handleChatMessage(user, {
      type: 'chatMessage',
      content: { text: 'ok', imageData: 'x'.repeat(111 * 1024) },
    });
    expect(mockHandleMailAll).not.toHaveBeenCalled();
  });
  it('should call handleMailAll for valid chatMessage', async () => {
    const { handleChatMessage } = serverModule;
    await handleChatMessage(user, {
      type: 'chatMessage',
      content: { text: 'ok' },
    });
    expect(mockHandleMailAll).toHaveBeenCalled();
  });
});

describe('handleMailAll', () => {
  let user: FullUser;
  let mockSendMessagesAll: jest.Mock;
  let mockLogMessage: jest.Mock;
  beforeEach(() => {
    user = new FullUser(
      'id',
      {
        name: 'TestUser',
        moderatorLevel: 0,
        isLoggedIn: true,
        isMobile: false,
        words: [],
        isBanned: false,
        xp: 0,
      },
      { send: jest.fn() } as unknown as WS,
      '127.0.0.1',
    );
    mockSendMessagesAll = jest.spyOn(serverModule, 'sendMessagesAll').mockImplementation(() => {}) as jest.Mock;
    mockLogMessage = jest.spyOn(serverModule, 'logMessage').mockImplementation(() => {}) as jest.Mock;
    mockedDatabaseService.saveMessage.mockClear();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should send and log if saveMessage returns a message', async () => {
    mockedDatabaseService.saveMessage.mockResolvedValue({ id: 1 });
    const { handleMailAll } = serverModule;
    await handleMailAll(user, { type: 'chatMessage', content: { text: 'hi' } });
    expect(mockSendMessagesAll).toHaveBeenCalled();
    expect(mockLogMessage).toHaveBeenCalled();
  });
  it('should log error if saveMessage fails', async () => {
    mockedDatabaseService.saveMessage.mockResolvedValue(null);
    const { handleMailAll } = serverModule;
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await handleMailAll(user, { type: 'chatMessage', content: { text: 'hi' } });
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Failed to save message'));
  });
  it('should log error if saveMessage throws', async () => {
    mockedDatabaseService.saveMessage.mockRejectedValue(new Error('fail'));
    const { handleMailAll } = serverModule;
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await handleMailAll(user, { type: 'chatMessage', content: { text: 'hi' } });
    expect(mockError).toHaveBeenCalledWith('Error saving message:', expect.any(Error));
  });
});

describe('handleScoreToChat', () => {
  let user: FullUser;
  let mockSendMessagesAll: jest.Mock;
  let mockLogMessage: jest.Mock;
  beforeEach(() => {
    user = new FullUser(
      'id',
      {
        name: 'TestUser',
        moderatorLevel: 0,
        isLoggedIn: true,
        isMobile: false,
        words: [],
        isBanned: false,
        xp: 0,
      },
      { send: jest.fn() } as unknown as WS,
      '127.0.0.1',
    );
    mockSendMessagesAll = jest.spyOn(serverModule, 'sendMessagesAll').mockImplementation(() => {}) as jest.Mock;
    mockLogMessage = jest.spyOn(serverModule, 'logMessage').mockImplementation(() => {}) as jest.Mock;
    mockedDatabaseService.saveMessage.mockClear();
    mockedDatabaseService.getTodaysWord.mockResolvedValue('WORD');
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should return if user already sent score', async () => {
    const { handleScoreToChat } = serverModule;
    await handleScoreToChat(user, {
      type: 'scoreToChat',
      content: { attempts: [['W', 'O', 'R', 'D']] },
    });
    expect(mockSendMessagesAll).not.toHaveBeenCalled();
  });
  it('should return if attempts invalid', async () => {
    const { handleScoreToChat } = serverModule;
    await handleScoreToChat(user, {
      type: 'scoreToChat',
      content: { attempts: [] },
    });
    expect(mockSendMessagesAll).not.toHaveBeenCalled();
  });
  it('should return if no scoreSolution', async () => {
    mockedDatabaseService.getTodaysWord.mockResolvedValueOnce(null);
    const { handleScoreToChat } = serverModule;
    await handleScoreToChat(user, {
      type: 'scoreToChat',
      content: { attempts: [['W', 'O', 'R', 'D']] },
    });
    expect(mockSendMessagesAll).not.toHaveBeenCalled();
  });
  it('should return if attempts are not valid', async () => {
    const { handleScoreToChat } = serverModule;
    await handleScoreToChat(user, {
      type: 'scoreToChat',
      content: { attempts: [['X', 'O', 'R', 'D']] },
    });
    expect(mockSendMessagesAll).not.toHaveBeenCalled();
  });
  it('should send and log if valid', async () => {
    mockedDatabaseService.saveMessage.mockResolvedValue({ id: 1 });
    const { handleScoreToChat } = serverModule;
    await handleScoreToChat(user, {
      type: 'scoreToChat',
      content: { attempts: [['W', 'O', 'R', 'D']] },
    });
    expect(mockSendMessagesAll).toHaveBeenCalled();
    expect(mockLogMessage).toHaveBeenCalled();
  });
  it('should log error if saveMessage fails', async () => {
    mockedDatabaseService.saveMessage.mockResolvedValue(null);
    const { handleScoreToChat } = serverModule;
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await handleScoreToChat(user, {
      type: 'scoreToChat',
      content: { attempts: [['W', 'O', 'R', 'D']] },
    });
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Failed to save score message'));
  });
  it('should log error if saveMessage throws', async () => {
    mockedDatabaseService.saveMessage.mockRejectedValue(new Error('fail'));
    const { handleScoreToChat } = serverModule;
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await handleScoreToChat(user, {
      type: 'scoreToChat',
      content: { attempts: [['W', 'O', 'R', 'D']] },
    });
    expect(mockError).toHaveBeenCalledWith('Error saving score message:', expect.any(Error));
  });
});

describe('handleDeleteMessage', () => {
  let user: FullUser;
  let mockSend: jest.Mock;
  beforeEach(() => {
    mockSend = jest.fn();
    user = new FullUser(
      'id',
      {
        name: 'TestUser',
        moderatorLevel: 1,
        isLoggedIn: true,
        isMobile: false,
        words: [],
        isBanned: false,
        xp: 0,
      },
      { send: mockSend } as unknown as WS,
      '127.0.0.1',
    );
    mockedDatabaseService.toggleMessage.mockClear();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should return if not moderator', async () => {
    user.privateUser.moderatorLevel = 0;
    const { handleDeleteMessage } = serverModule;
    await handleDeleteMessage(user, 1);
    expect(mockedDatabaseService.toggleMessage).not.toHaveBeenCalled();
  });
  it('should return if messageId is NaN', async () => {
    const { handleDeleteMessage } = serverModule;
    await handleDeleteMessage(user, NaN);
    expect(mockedDatabaseService.toggleMessage).not.toHaveBeenCalled();
  });
  it('should send success and broadcast if deleted', async () => {
    mockedDatabaseService.toggleMessage.mockResolvedValue(true);
    const { handleDeleteMessage } = serverModule;
    await handleDeleteMessage(user, 1);
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Successfully deleted message'));
  });
  it('should send fail if not deleted', async () => {
    mockedDatabaseService.toggleMessage.mockResolvedValue(false);
    const { handleDeleteMessage } = serverModule;
    await handleDeleteMessage(user, 1);
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Failed to delete message'));
  });
  it('should log error if throws', async () => {
    mockedDatabaseService.toggleMessage.mockRejectedValue(new Error('fail'));
    const { handleDeleteMessage } = serverModule;
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await handleDeleteMessage(user, 1);
    expect(mockError).toHaveBeenCalledWith('Error deleting message:', expect.any(Error));
  });
});

describe('handleCustomMessageType', () => {
  let user: FullUser;
  let mockSend: jest.Mock;
  beforeEach(() => {
    mockSend = jest.fn();
    user = new FullUser(
      'id',
      {
        name: 'TestUser',
        moderatorLevel: 1,
        isLoggedIn: true,
        isMobile: false,
        words: [],
        isBanned: false,
        xp: 0,
      },
      { send: mockSend } as unknown as WS,
      '127.0.0.1',
    );
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(require('../src/store'), 'store').mockReturnValue({
      getState: () => ({ users: { [user.id]: user } }),
    });
    user.listeningTypes = ['customType'];
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should send to all listeners if type matches', () => {
    const { handleCustomMessageType } = serverModule;
    handleCustomMessageType(user, 'customType', { foo: 'bar' });
    expect(mockSend).toHaveBeenCalledWith(JSON.stringify({ type: 'customType', content: { foo: 'bar' } }));
  });
  it('should log if no listeners', () => {
    const { handleCustomMessageType } = serverModule;
    user.listeningTypes = [];
    handleCustomMessageType(user, 'otherType', {});
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Wrong message type or empty'));
  });
});

describe('updateUsersList', () => {
  let mockSendMessagesAll: jest.Mock;
  beforeEach(() => {
    mockSendMessagesAll = jest.spyOn(serverModule, 'sendMessagesAll').mockImplementation(() => {}) as jest.Mock;
    jest.spyOn(require('../src/store'), 'store').mockReturnValue({
      getState: () => ({
        users: {
          id1: {
            privateUser: {
              name: 'A',
              moderatorLevel: 1,
              isMobile: false,
              isLoggedIn: true,
              xp: 0,
            },
          },
          id2: {
            privateUser: {
              name: 'B',
              moderatorLevel: 0,
              isMobile: true,
              isLoggedIn: false,
              xp: 10,
            },
          },
          id3: {
            privateUser: {
              name: 'A',
              moderatorLevel: 1,
              isMobile: false,
              isLoggedIn: true,
              xp: 0,
            },
          },
        },
      }),
    });
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should send user list with unique names', () => {
    const { updateUsersList } = serverModule;
    updateUsersList();
    expect(mockSendMessagesAll).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(String),
        content: [expect.objectContaining({ name: 'A' }), expect.objectContaining({ name: 'B' })],
      }),
    );
  });
});

describe('sendMessagesAll', () => {
  it('should send message to all open clients', () => {
    const { sendMessagesAll } = serverModule;
    const mockClient = { readyState: 1, send: jest.fn() };
    const wss = { clients: [mockClient] };
    serverModule.wss = wss;
    sendMessagesAll({ type: 'test', content: 'hi' });
    expect(mockClient.send).toHaveBeenCalledWith(JSON.stringify({ type: 'test', content: 'hi' }));
  });
});
