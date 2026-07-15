import { Server } from '@surtom/interfaces';
import FullUser from '../../models/FullUser.js';

jest.mock('../../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
  sendToUser: jest.fn(),
}));

import { sendError, sendToUser } from '../../ws/send.js';
import { handleHelpCommand } from './handler.js';

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

describe('handleHelpCommand', () => {
  it('rejects when extra args are passed', () => {
    handleHelpCommand(buildUser(), ['help', 'extra']);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Utilisation : /help');
  });

  it('sends an ENHANCED help message containing every available command for non-moderators', () => {
    handleHelpCommand(buildUser(0), ['help']);
    expect(sendToUser).toHaveBeenCalled();
    const message = (sendToUser as jest.Mock).mock.calls[0][1];
    expect(message.type).toBe(Server.MessageType.MESSAGE);
    expect(message.content.type).toBe(Server.MessageType.ENHANCED);
    const text = message.content.content.text;
    expect(text).toContain('/login pseudo mot_de_passe');
    expect(text).toContain('/help');
    expect(text).not.toContain('/eval');
  });

  it('includes moderator commands when the user is a moderator', () => {
    handleHelpCommand(buildUser(2), ['help']);
    const text = (sendToUser as jest.Mock).mock.calls[0][1].content.content.text;
    expect(text).toContain('/addtype');
  });
});
