import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { TYPING_MIN_INTERVAL_MS } from '../config/constants.js';

jest.mock('../ws/broadcast.js', () => ({
  __esModule: true,
  broadcastToWorldButSelf: jest.fn(),
}));

import { broadcastToWorldButSelf } from '../ws/broadcast.js';
import { handleIsTyping } from './typingHandler.js';

const fakeWs = {} as never;

function makeUser(worldId: string | null = 'ephem'): FullUser {
  return new FullUser(
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
    worldId,
  );
}

describe('handleIsTyping', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(1_000_000);
    (broadcastToWorldButSelf as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("broadcasts the user's name to the others in their world", () => {
    const user = makeUser();

    handleIsTyping(user);

    expect(broadcastToWorldButSelf).toHaveBeenCalledWith(user, {
      type: Server.MessageType.IS_TYPING,
      content: 'alice',
    });
  });

  it('does nothing when the user is not in a world', () => {
    handleIsTyping(makeUser(null));

    expect(broadcastToWorldButSelf).not.toHaveBeenCalled();
  });

  it('drops messages arriving faster than the minimum interval', () => {
    const user = makeUser();

    handleIsTyping(user);
    jest.advanceTimersByTime(TYPING_MIN_INTERVAL_MS - 1);
    handleIsTyping(user);

    expect(broadcastToWorldButSelf).toHaveBeenCalledTimes(1);
  });

  it('broadcasts again once the minimum interval has elapsed', () => {
    const user = makeUser();

    handleIsTyping(user);
    jest.advanceTimersByTime(TYPING_MIN_INTERVAL_MS);
    handleIsTyping(user);

    expect(broadcastToWorldButSelf).toHaveBeenCalledTimes(2);
  });

  it('throttles each user independently', () => {
    handleIsTyping(makeUser());
    handleIsTyping(makeUser());

    expect(broadcastToWorldButSelf).toHaveBeenCalledTimes(2);
  });
});
