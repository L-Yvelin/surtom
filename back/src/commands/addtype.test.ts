import FullUser from '../models/FullUser.js';

jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
  sendSuccess: jest.fn(),
}));

import { sendError, sendSuccess } from '../ws/send.js';
import { handleAddTypeCommand } from './addtype.js';

const fakeWs = {} as never;

const buildUser = () =>
  new FullUser(
    'id-1',
    {
      name: 'alice',
      moderatorLevel: 1,
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

describe('handleAddTypeCommand', () => {
  it('appends a valid type and acknowledges success', async () => {
    const user = buildUser();
    await handleAddTypeCommand(user, ['addtype', 'cursor']);
    expect(user.listeningTypes).toEqual(['cursor']);
    expect(sendSuccess).toHaveBeenCalledWith(fakeWs, 'Vous écoutez maintenant le type : cursor');
  });

  it('rejects invalid types', async () => {
    const user = buildUser();
    await handleAddTypeCommand(user, ['addtype', 'bad type!']);
    expect(user.listeningTypes).toEqual([]);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Type invalide');
  });

  it('lists the current listening types when called with no args', async () => {
    const user = buildUser();
    user.listeningTypes.push('a', 'b');
    await handleAddTypeCommand(user, ['addtype']);
    expect(sendSuccess).toHaveBeenCalledWith(fakeWs, 'Vous écoutez les types : a, b');
  });

  it('rejects when too many args are provided', async () => {
    const user = buildUser();
    await handleAddTypeCommand(user, ['addtype', 'a', 'b']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Utilisation : /listen type');
  });
});
