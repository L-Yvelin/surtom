import FullUser from '../models/FullUser.js';

jest.mock('../ws/send.js', () => ({
  __esModule: true,
  sendError: jest.fn(),
}));

import { sendError } from '../ws/send.js';
import { handleNickCommand } from './nick.js';

const fakeWs = {} as never;

describe('handleNickCommand', () => {
  it('always replies with the legacy refusal message', async () => {
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
    await handleNickCommand(user);
    expect(sendError).toHaveBeenCalledWith(fakeWs, 'Eh non pardi ! Les temps ont changé...');
  });
});
