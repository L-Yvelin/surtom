import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';

jest.mock('../ws/broadcast.js', () => ({
  __esModule: true,
  broadcastToWorldButSelf: jest.fn(),
}));

import { broadcastToWorldButSelf } from '../ws/broadcast.js';
import { handleCursorPosition } from './cursorHandler.js';

const fakeWs = {} as never;

describe('handleCursorPosition', () => {
  it('broadcasts the cursor position to everyone but the sender', () => {
    const user = new FullUser(
      'id-1',
      {
        name: 'alice',
        moderatorLevel: 0,
        isLoggedIn: true,
        isMobile: false,
        words: [],
        isBanned: false,
        xp: 0,
      },
      fakeWs,
      'ip',
    );

    handleCursorPosition(user, { x: 12, y: 34 });

    expect(broadcastToWorldButSelf).toHaveBeenCalledWith(user, {
      type: Server.MessageType.CURSOR_POSITION,
      content: {
        user: { name: 'alice', moderatorLevel: 0, isMobile: false, isLoggedIn: true, xp: 0 },
        cursor: { x: 12, y: 34 },
      },
    });
  });
});
