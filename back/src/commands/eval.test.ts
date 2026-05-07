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
import { handleEvalCommand } from './eval.js';

const fakeWs = {} as never;

const buildUser = (moderatorLevel = 0) =>
  new FullUser(
    'id-1',
    {
      name: 'someone',
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

describe('handleEvalCommand', () => {
  it('refuses non-moderators', async () => {
    await handleEvalCommand(buildUser(0), ['eval', '@a', 'alert(1)']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, '¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿');
  });

  it('reports usage when too few args are given', async () => {
    await handleEvalCommand(buildUser(2), ['eval', '@a']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Utilisation : /eval pseudo ¿¿¿¿¿');
  });

  it('blocks any payload referencing cookies', async () => {
    await handleEvalCommand(buildUser(2), ['eval', '@a', 'document.cookie']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Pas touche aux 🍪 !');
  });

  it('sends an EVAL message to each targeted user', async () => {
    const target = buildUser(0);
    (getTargetedUsers as jest.Mock).mockReturnValue([target]);
    await handleEvalCommand(buildUser(2), ['eval', '@a', 'alert(1)']);
    expect(sendToUser).toHaveBeenCalledWith(fakeWs, { type: Server.MessageType.EVAL, content: 'alert(1)' });
  });
});
