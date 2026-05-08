import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';

jest.mock('../ws/broadcast.js', () => ({
  __esModule: true,
  broadcastToWorld: jest.fn(),
}));

import { broadcastToWorld } from '../ws/broadcast.js';
import { handleIsTyping } from './typingHandler.js';

const fakeWs = {} as never;

describe('handleIsTyping', () => {
  it("broadcasts the user's name to everyone in their world", () => {
    const user = new FullUser(
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
      'ephem',
    );

    handleIsTyping(user);

    expect(broadcastToWorld).toHaveBeenCalledWith('ephem', {
      type: Server.MessageType.IS_TYPING,
      content: 'alice',
    });
  });
});
