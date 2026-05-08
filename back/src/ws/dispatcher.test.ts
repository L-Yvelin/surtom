import { Client } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';

jest.mock('../commands/index.js', () => ({ __esModule: true, handleCommand: jest.fn() }));
jest.mock('../handlers/chatHandler.js', () => ({ __esModule: true, handleChatMessage: jest.fn() }));
jest.mock('../handlers/deleteHandler.js', () => ({ __esModule: true, handleDeleteMessage: jest.fn() }));
jest.mock('../handlers/tryHandler.js', () => ({ __esModule: true, handleTryMessage: jest.fn() }));
jest.mock('../handlers/cursorHandler.js', () => ({ __esModule: true, handleCursorPosition: jest.fn() }));
jest.mock('../handlers/typingHandler.js', () => ({ __esModule: true, handleIsTyping: jest.fn() }));
jest.mock('../handlers/joinWorldHandler.js', () => ({ __esModule: true, handleJoinWorld: jest.fn() }));
jest.mock('./customType.js', () => ({ __esModule: true, dispatchCustomMessage: jest.fn() }));

import { handleCommand } from '../commands/index.js';
import { handleChatMessage } from '../handlers/chatHandler.js';
import { handleDeleteMessage } from '../handlers/deleteHandler.js';
import { handleTryMessage } from '../handlers/tryHandler.js';
import { handleCursorPosition } from '../handlers/cursorHandler.js';
import { handleIsTyping } from '../handlers/typingHandler.js';
import { handleJoinWorld } from '../handlers/joinWorldHandler.js';
import { dispatchCustomMessage } from './customType.js';
import { handleMessage, shouldLogMessage } from './dispatcher.js';
import { RATE_LIMIT_FREE_MESSAGES, COOLDOWN_INITIAL_SECONDS } from '../config/constants.js';

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('shouldLogMessage', () => {
  it('returns false for silent message types', () => {
    expect(shouldLogMessage(Client.MessageType.PING)).toBe(false);
    expect(shouldLogMessage(Client.MessageType.IS_TYPING)).toBe(false);
    expect(shouldLogMessage(Client.MessageType.CURSOR_POSITION)).toBe(false);
  });

  it('returns true for any other type', () => {
    expect(shouldLogMessage(Client.MessageType.CHAT_MESSAGE)).toBe(true);
    expect(shouldLogMessage(Client.MessageType.TRY)).toBe(true);
  });
});

describe('handleMessage routing', () => {
  it('drops PINGs without dispatching', async () => {
    await handleMessage(buildUser(), { type: Client.MessageType.PING });
    expect(handleChatMessage).not.toHaveBeenCalled();
  });

  it('routes a slash chat message to the command handler', async () => {
    await handleMessage(buildUser(), { type: Client.MessageType.CHAT_MESSAGE, content: { text: '/help' } });
    expect(handleCommand).toHaveBeenCalledWith(expect.any(Object), 'help');
    expect(handleChatMessage).not.toHaveBeenCalled();
  });

  it('routes a regular chat message to the chat handler', async () => {
    const message = { type: Client.MessageType.CHAT_MESSAGE, content: { text: 'hello' } } as Client.ChatMessage;
    await handleMessage(buildUser(), message);
    expect(handleChatMessage).toHaveBeenCalledWith(expect.any(Object), message);
  });

  it('routes SCORE_TO_CHAT to the chat handler', async () => {
    const message = {
      type: Client.MessageType.SCORE_TO_CHAT,
      content: { attempts: [['G', 'R', 'A', 'S', 'S']] },
    } as unknown as Client.Message;
    await handleMessage(buildUser(), message);
    expect(handleChatMessage).toHaveBeenCalledWith(expect.any(Object), message);
  });

  it('routes DELETE_MESSAGE to the delete handler', async () => {
    await handleMessage(buildUser(2), { type: Client.MessageType.DELETE_MESSAGE, content: 7 });
    expect(handleDeleteMessage).toHaveBeenCalledWith(expect.any(Object), 7);
  });

  it('routes IS_TYPING to the typing handler without rate-limiting', async () => {
    const user = buildUser();
    user.messageCount = 9999;
    await handleMessage(user, { type: Client.MessageType.IS_TYPING });
    expect(handleIsTyping).toHaveBeenCalled();
  });

  it('routes TRY to the try handler', async () => {
    await handleMessage(buildUser(), { type: Client.MessageType.TRY, content: 'GRASS' });
    expect(handleTryMessage).toHaveBeenCalledWith(expect.any(Object), 'GRASS');
  });

  it('routes CURSOR_POSITION to the cursor handler', async () => {
    await handleMessage(buildUser(), {
      type: Client.MessageType.CURSOR_POSITION,
      content: { cursor: { x: 1, y: 2 } },
    } as Client.Message);
    expect(handleCursorPosition).toHaveBeenCalledWith(expect.any(Object), { x: 1, y: 2 });
  });

  it('routes JOIN_WORLD to the join world handler', async () => {
    await handleMessage(buildUser(), { type: Client.MessageType.JOIN_WORLD, content: { worldId: 'ephem' } });
    expect(handleJoinWorld).toHaveBeenCalledWith(expect.any(Object), { worldId: 'ephem' });
  });

  it('falls back to dispatchCustomMessage for unknown types', async () => {
    await handleMessage(buildUser(), { type: 'custom', content: { hello: 'world' } } as unknown as Client.Message);
    expect(dispatchCustomMessage).toHaveBeenCalledWith(expect.any(Object), 'custom', { hello: 'world' });
  });
});

describe('rate limiting', () => {
  it('does not rate-limit moderators', async () => {
    const mod = buildUser(2);
    for (let i = 0; i < RATE_LIMIT_FREE_MESSAGES + 5; i++) {
      await handleMessage(mod, { type: Client.MessageType.CHAT_MESSAGE, content: { text: 'hi' } });
    }
    expect(handleChatMessage).toHaveBeenCalledTimes(RATE_LIMIT_FREE_MESSAGES + 5);
  });

  it('applies a cooldown to non-moderators after the free quota', async () => {
    const user = buildUser();
    const message = { type: Client.MessageType.CHAT_MESSAGE, content: { text: 'spam' } } as Client.ChatMessage;

    for (let i = 0; i < RATE_LIMIT_FREE_MESSAGES; i++) {
      await handleMessage(user, message);
    }
    const baseline = (handleChatMessage as jest.Mock).mock.calls.length;

    user.lastMessageTimestamp = new Date().toISOString();
    await handleMessage(user, message);
    expect((handleChatMessage as jest.Mock).mock.calls.length).toBe(baseline);
    expect(user.messageCooldown).toBe(COOLDOWN_INITIAL_SECONDS * user.cooldownMultiplier);
  });

  it('resets the cooldown to the initial value once enough time has elapsed', async () => {
    const user = buildUser();
    const message = { type: Client.MessageType.CHAT_MESSAGE, content: { text: 'hi' } } as Client.ChatMessage;
    user.messageCount = RATE_LIMIT_FREE_MESSAGES + 1;
    user.messageCooldown = COOLDOWN_INITIAL_SECONDS * 2;
    user.lastMessageTimestamp = new Date(Date.now() - (user.messageCooldown * 1000 + 5000)).toISOString();
    await handleMessage(user, message);
    expect(handleChatMessage).toHaveBeenCalled();
    expect(user.messageCooldown).toBe(COOLDOWN_INITIAL_SECONDS);
  });
});
