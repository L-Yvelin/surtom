import FullUser from '../models/FullUser.js';

jest.mock('../repositories/playerRepository.js', () => ({
  __esModule: true,
  registerPlayer: jest.fn(),
  getPlayerByName: jest.fn(),
}));
jest.mock('./session.js', () => ({
  __esModule: true,
  applyLoginSession: jest.fn(),
}));
jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
}));

import { registerPlayer, getPlayerByName } from '../repositories/playerRepository.js';
import { applyLoginSession } from './session.js';
import { sendError } from '../ws/send.js';
import { handleRegisterCommand } from './register.js';

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

describe('handleRegisterCommand', () => {
  it('reports usage on the wrong number of args', async () => {
    await handleRegisterCommand(buildUser(), ['register', 'alice']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Utilisation : /register pseudo mot_de_passe');
  });

  it('rejects an invalid username', async () => {
    await handleRegisterCommand(buildUser(), ['register', 'bad name!', 'pw']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, "Ce pseudo n'est pas disponible...");
    expect(registerPlayer).not.toHaveBeenCalled();
  });

  it('rejects when the username collides with a funny name', async () => {
    await handleRegisterCommand(buildUser(), ['register', 'Surtomien', 'pw']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, "Ce pseudo n'est pas disponible...");
  });

  it('persists the player and starts a session on success', async () => {
    (registerPlayer as jest.Mock).mockResolvedValue(undefined);
    (getPlayerByName as jest.Mock).mockResolvedValue({ id: 1, username: 'newcomer', isAdmin: 0, isBanned: 0 });
    const user = buildUser();
    await handleRegisterCommand(user, ['register', 'newcomer', 'pw']);
    expect(registerPlayer).toHaveBeenCalledWith('newcomer', 'pw');
    expect(applyLoginSession).toHaveBeenCalledWith(user, expect.objectContaining({ username: 'newcomer' }), 'Bienvenue newcomer !');
  });

  it('forwards repository errors via sendError', async () => {
    (registerPlayer as jest.Mock).mockRejectedValue(new Error('Oups, pseudo déjà pris.'));
    await handleRegisterCommand(buildUser(), ['register', 'taken', 'pw']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Oups, pseudo déjà pris.');
  });
});
