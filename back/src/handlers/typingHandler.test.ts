import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';

jest.mock('../ws/broadcast.js', () => ({
  __esModule: true,
  broadcastAll: jest.fn(),
}));

import { broadcastAll } from '../ws/broadcast.js';
import { handleIsTyping } from './typingHandler.js';

const fakeWs = {} as never;

describe('handleIsTyping', () => {
  it("broadcasts the user's name to everyone", () => {
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
    );

    handleIsTyping(user);

    expect(broadcastAll).toHaveBeenCalledWith({
      type: Server.MessageType.IS_TYPING,
      content: 'alice',
    });
  });
});
