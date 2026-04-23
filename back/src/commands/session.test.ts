import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';

jest.mock('../utils/crypto.js', () => ({
  __esModule: true,
  generateRandomHash: jest.fn(() => 'fixed-hash'),
  passwordInHashArray: jest.fn(),
}));
jest.mock('../repositories/playerRepository.js', () => ({
  __esModule: true,
  storeSessionHash: jest.fn(),
  loginPlayer: jest.fn(),
}));
jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
  sendSuccess: jest.fn(),
  sendToUser: jest.fn(),
}));
jest.mock('../utils/ban.js', () => ({
  __esModule: true,
  handleIsBanned: jest.fn(),
}));
jest.mock('../state/eventBus.js', () => ({
  __esModule: true,
  publish: jest.fn(),
  subscribe: jest.fn(),
}));

import { storeSessionHash, loginPlayer } from '../repositories/playerRepository.js';
import { sendError, sendSuccess, sendToUser } from '../ws/send.js';
import { handleIsBanned } from '../utils/ban.js';
import { publish } from '../state/eventBus.js';
import { applyLoginSession, loginUserAndSendSession } from './session.js';

const fakeWs = {} as never;

const buildUser = () =>
  new FullUser(
    'id-1',
    {
      name: 'someone',
      moderatorLevel: 0,
      isLoggedIn: false,
      isMobile: false,
      words: [],
      isBanned: false,
      xp: 0,
    },
    fakeWs,
    'ip',
  );

const buildPlayer = (
  overrides: Partial<{ id: number; username: string; isAdmin: number; isBanned: number; sessionHash?: string }> = {},
) => ({
  id: 1,
  username: 'alice',
  password: 'pwhash',
  registrationDate: new Date('2024-01-01'),
  isAdmin: 0,
  isBanned: 0,
  sessionHash: undefined as string | undefined,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('applyLoginSession', () => {
  it('updates the privateUser, generates and stores a fresh session hash', async () => {
    const user = buildUser();
    await applyLoginSession(user, buildPlayer({ id: 7, username: 'alice', isAdmin: 1 }), 'Welcome');

    expect(user.privateUser.name).toBe('alice');
    expect(user.privateUser.moderatorLevel).toBe(1);
    expect(user.privateUser.isLoggedIn).toBe(true);
    expect(storeSessionHash).toHaveBeenCalledWith(7, 'fixed-hash');
  });

  it('reuses an existing session hash when present', async () => {
    const user = buildUser();
    await applyLoginSession(user, buildPlayer({ sessionHash: 'old-hash' }), 'Welcome');
    expect(storeSessionHash).not.toHaveBeenCalled();
    const sent = (sendToUser as jest.Mock).mock.calls[0][1];
    expect(sent.content.sessionHash).toBe('old-hash');
  });

  it('sends LOGIN, success and publishes updateUsersList', async () => {
    const user = buildUser();
    await applyLoginSession(user, buildPlayer(), 'Welcome');

    const loginCall = (sendToUser as jest.Mock).mock.calls.find(([, m]) => m.type === Server.MessageType.LOGIN);
    expect(loginCall).toBeDefined();
    expect(sendSuccess).toHaveBeenCalledWith(fakeWs, 'Welcome');
    expect(publish).toHaveBeenCalledWith('updateUsersList');
  });
});

describe('loginUserAndSendSession', () => {
  it('returns false and shows the ban payload when the player is banned', async () => {
    (loginPlayer as jest.Mock).mockResolvedValue(buildPlayer({ isBanned: 1 }));
    const user = buildUser();
    const ok = await loginUserAndSendSession(user, 'alice', 'pw');
    expect(ok).toBe(false);
    expect(handleIsBanned).toHaveBeenCalledWith(user);
  });

  it('returns true and sends a "Rebonjour" message on success', async () => {
    (loginPlayer as jest.Mock).mockResolvedValue(buildPlayer({ username: 'alice' }));
    const user = buildUser();
    const ok = await loginUserAndSendSession(user, 'alice', 'pw');
    expect(ok).toBe(true);
    expect(sendSuccess).toHaveBeenCalledWith(fakeWs, 'Rebonjour alice !');
  });

  it('reports the error message on failure', async () => {
    (loginPlayer as jest.Mock).mockRejectedValue(new Error('Mauvais mot de passe.'));
    const ok = await loginUserAndSendSession(buildUser(), 'alice', 'pw');
    expect(ok).toBe(false);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Mauvais mot de passe.');
  });
});
