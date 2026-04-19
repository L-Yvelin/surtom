import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import store from '../state/store.js';

jest.mock('./targeting.js', () => ({
  __esModule: true,
  getTargetedUsers: jest.fn(),
}));
jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
  sendSuccess: jest.fn(),
  sendToUser: jest.fn(),
}));

import { getTargetedUsers } from './targeting.js';
import { sendError, sendSuccess, sendToUser } from '../ws/send.js';
import { handleTellrawCommand } from './tellraw.js';

const fakeWs = {} as never;

const buildUser = (name: string, moderatorLevel = 0) =>
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
  store.setState({ users: {} });
});

describe('handleTellrawCommand', () => {
  it('refuses non-moderators', async () => {
    await handleTellrawCommand(buildUser('alice', 0), ['tellraw', '{}']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, "Vous n'êtes pas autorisé à utiliser cette commande.");
  });

  it('rejects an invalid JSON payload', async () => {
    await handleTellrawCommand(buildUser('mod', 2), ['tellraw', 'not-json']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, "L'objet JSON est invalide.");
  });

  it('broadcasts to every user when no target is given', async () => {
    const a = buildUser('alice');
    const b = buildUser('bob');
    store.setState({ users: { 'id-alice': a, 'id-bob': b } });
    await handleTellrawCommand(buildUser('mod', 2), ['tellraw', '{"text":"hi"}']);
    expect(sendToUser).toHaveBeenCalledTimes(2);
    const messages = (sendToUser as jest.Mock).mock.calls.map(([, m]) => m);
    expect(messages.every((m) => m.type === Server.MessageType.MESSAGE && m.content.type === Server.MessageType.ENHANCED)).toBe(true);
  });

  it('uses targeting when a target is given', async () => {
    const target = buildUser('alice');
    (getTargetedUsers as jest.Mock).mockReturnValue([target]);
    await handleTellrawCommand(buildUser('mod', 2), ['tellraw', 'alice', '{"text":"hi"}']);
    expect(getTargetedUsers).toHaveBeenCalledWith('alice', expect.any(Object));
    expect(sendToUser).toHaveBeenCalled();
    expect(sendSuccess).toHaveBeenCalledWith(fakeWs, 'Message envoyé à alice');
  });
});
