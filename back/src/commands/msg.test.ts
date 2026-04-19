import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';

jest.mock('./targeting.js', () => ({
  __esModule: true,
  getTargetedUsers: jest.fn(),
}));
jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
  sendToUser: jest.fn(),
}));

import { getTargetedUsers } from './targeting.js';
import { sendError, sendToUser } from '../ws/send.js';
import { handleMsgCommand } from './msg.js';

const fakeWs = {} as never;

const buildUser = (name = 'sender', moderatorLevel = 0) =>
  new FullUser(
    `id-${name}`,
    {
      name,
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

describe('handleMsgCommand', () => {
  it('reports usage when too few args are given', async () => {
    await handleMsgCommand(buildUser(), ['msg', 'alice']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Utilisation : /msg pseudo message');
  });

  it('does nothing when no targets are returned', async () => {
    (getTargetedUsers as jest.Mock).mockReturnValue([]);
    await handleMsgCommand(buildUser(), ['msg', 'nope', 'hello']);
    expect(sendToUser).not.toHaveBeenCalled();
  });

  it('rejects invalid text from non-moderators', async () => {
    (getTargetedUsers as jest.Mock).mockReturnValue([buildUser('target')]);
    await handleMsgCommand(buildUser('sender', 0), ['msg', 'target', '']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Pseudo ou message invalide');
  });

  it('sends a private message to the target and an echo to the sender', async () => {
    const target = buildUser('target');
    (getTargetedUsers as jest.Mock).mockReturnValue([target]);
    const sender = buildUser('sender');
    await handleMsgCommand(sender, ['msg', 'target', 'hello', 'world']);

    expect(sendToUser).toHaveBeenCalledTimes(2);
    const calls = (sendToUser as jest.Mock).mock.calls;
    const messages = calls.map(([, m]) => m);
    expect(messages.every((m) => m.type === Server.MessageType.MESSAGE)).toBe(true);
    expect(messages.every((m) => m.content.type === Server.MessageType.PRIVATE_MESSAGE)).toBe(true);
    expect(messages.every((m) => m.content.content.text === 'hello world')).toBe(true);
  });
});
