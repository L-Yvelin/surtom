import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';

jest.mock('./targeting.js', () => ({
  __esModule: true,
  getTargetedUsers: jest.fn(),
}));
jest.mock('../repositories/messageRepository.js', () => ({
  __esModule: true,
  getMessages: jest.fn(),
}));
jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
  sendSuccess: jest.fn(),
  sendToUser: jest.fn(),
}));

import { getTargetedUsers } from './targeting.js';
import { getMessages } from '../repositories/messageRepository.js';
import { sendError, sendSuccess, sendToUser } from '../ws/send.js';
import { handleRefreshCommand } from './refresh.js';

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
    'fr',
  );

const buildSavedTextMessage = (id: string): Server.ChatMessage.SavedType => ({
  type: Server.MessageType.TEXT,
  content: {
    id,
    user: { name: 'a', moderatorLevel: 0 },
    text: 'msg',
    timestamp: 'now',
    deleted: 0,
  },
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('handleRefreshCommand', () => {
  it('refreshes only the requester when called without args', async () => {
    (getMessages as jest.Mock).mockResolvedValue([buildSavedTextMessage('1')]);
    const user = buildUser(0);
    await handleRefreshCommand(user, ['refresh']);
    expect(sendToUser).toHaveBeenCalledWith(fakeWs, expect.objectContaining({ type: Server.MessageType.GET_MESSAGES }));
    expect(sendSuccess).toHaveBeenCalledWith(fakeWs, 'Chat rafraîchi !');
  });

  it('refuses targeting from non-moderators', async () => {
    await handleRefreshCommand(buildUser(0), ['refresh', '@a']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, "Vous n'êtes pas autorisé à utiliser cette commande.");
    expect(getMessages).not.toHaveBeenCalled();
  });

  it('uses targeting for moderators', async () => {
    const target = buildUser(0);
    (getTargetedUsers as jest.Mock).mockReturnValue([target]);
    (getMessages as jest.Mock).mockResolvedValue([buildSavedTextMessage('1')]);
    await handleRefreshCommand(buildUser(2), ['refresh', '@a']);
    expect(getTargetedUsers).toHaveBeenCalledWith('@a', expect.any(Object));
    expect(sendToUser).toHaveBeenCalled();
  });

  it('reports usage on too many args', async () => {
    await handleRefreshCommand(buildUser(0), ['refresh', '@a', 'extra']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Utilisation : /refresh target?');
  });

  it('filters out non-text/enhanced/score messages from the GET_MESSAGES payload', async () => {
    (getMessages as jest.Mock).mockResolvedValue([
      buildSavedTextMessage('1'),
      {
        type: Server.MessageType.PRIVATE_MESSAGE,
        content: { id: '2', user: { name: 'a', moderatorLevel: 0 }, text: 'pm', timestamp: 'now', deleted: 0 },
      },
    ]);
    await handleRefreshCommand(buildUser(0), ['refresh']);
    const call = (sendToUser as jest.Mock).mock.calls.find(([, m]) => m.type === Server.MessageType.GET_MESSAGES);
    expect(call?.[1].content).toHaveLength(1);
  });
});
