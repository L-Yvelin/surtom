import FullUser from '../models/FullUser.js';

jest.mock('./session.js', () => ({
  __esModule: true,
  loginUserAndSendSession: jest.fn(),
}));
jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
}));

import { loginUserAndSendSession } from './session.js';
import { sendError } from '../ws/send.js';
import { handleLoginCommand } from './login.js';

const fakeWs = {} as never;

const buildUser = () =>
  new FullUser(
    'id-1',
    {
      name: 'alice',
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('handleLoginCommand', () => {
  it('forwards a 3-part command to loginUserAndSendSession', async () => {
    const user = buildUser();
    await handleLoginCommand(user, ['login', 'alice', 'pw']);
    expect(loginUserAndSendSession).toHaveBeenCalledWith(user, 'alice', 'pw');
    expect(sendError).not.toHaveBeenCalled();
  });

  it('returns the usage error when the wrong number of args is given', async () => {
    const user = buildUser();
    await handleLoginCommand(user, ['login']);
    expect(loginUserAndSendSession).not.toHaveBeenCalled();
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Utilisation : /login pseudo mot_de_passe');
  });
});
