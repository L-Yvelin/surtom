import FullUser from '../models/FullUser.js';

jest.mock('./nick.js', () => ({ __esModule: true, handleNickCommand: jest.fn() }));
jest.mock('./login.js', () => ({ __esModule: true, handleLoginCommand: jest.fn() }));
jest.mock('./register.js', () => ({ __esModule: true, handleRegisterCommand: jest.fn() }));
jest.mock('./msg.js', () => ({ __esModule: true, handleMsgCommand: jest.fn() }));
jest.mock('./addtype.js', () => ({ __esModule: true, handleAddTypeCommand: jest.fn() }));
jest.mock('./refresh.js', () => ({ __esModule: true, handleRefreshCommand: jest.fn() }));
jest.mock('./tellraw.js', () => ({ __esModule: true, handleTellrawCommand: jest.fn() }));
jest.mock('./help/handler.js', () => ({ __esModule: true, handleHelpCommand: jest.fn() }));
jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
}));

import { handleNickCommand } from './nick.js';
import { handleLoginCommand } from './login.js';
import { handleRegisterCommand } from './register.js';
import { handleMsgCommand } from './msg.js';
import { handleAddTypeCommand } from './addtype.js';
import { handleRefreshCommand } from './refresh.js';
import { handleTellrawCommand } from './tellraw.js';
import { handleHelpCommand } from './help/handler.js';
import { sendError } from '../ws/send.js';
import { handleCommand } from './index.js';

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

describe('handleCommand router', () => {
  const cases: Array<[string, jest.Mock]> = [
    ['nick foo', handleNickCommand as jest.Mock],
    ['login a b', handleLoginCommand as jest.Mock],
    ['register a b', handleRegisterCommand as jest.Mock],
    ['msg a hi', handleMsgCommand as jest.Mock],
    ['addtype cursor', handleAddTypeCommand as jest.Mock],
    ['refresh', handleRefreshCommand as jest.Mock],
    ['tellraw {}', handleTellrawCommand as jest.Mock],
    ['help', handleHelpCommand as jest.Mock],
  ];

  it.each(cases)('routes %s to its handler', async (input, mock) => {
    await handleCommand(buildUser(), input);
    expect(mock).toHaveBeenCalledWith(expect.any(Object), input.split(' '));
  });

  it('is case-insensitive on the command name', async () => {
    await handleCommand(buildUser(), 'LoGiN a b');
    expect(handleLoginCommand).toHaveBeenCalled();
  });

  it('reports an unknown command', async () => {
    await handleCommand(buildUser(), 'doesnotexist');
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Commande invalide !');
  });
});
