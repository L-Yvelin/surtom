import FullUser from './FullUser.js';
import { COOLDOWN_INITIAL_SECONDS, COOLDOWN_MULTIPLIER } from '../config/constants.js';

const fakeWs = {} as never;

const buildPrivateUser = () => ({
  name: 'alice',
  moderatorLevel: 0,
  isLoggedIn: false,
  isMobile: false,
  words: [],
  isBanned: false,
  xp: 0,
});

describe('FullUser', () => {
  it('initializes its rate-limit fields with the configured defaults', () => {
    const user = new FullUser('id-1', buildPrivateUser(), fakeWs, '127.0.0.1');
    expect(user.messageCount).toBe(0);
    expect(user.lastMessageTimestamp).toBeNull();
    expect(user.messageCooldown).toBe(COOLDOWN_INITIAL_SECONDS);
    expect(user.cooldownMultiplier).toBe(COOLDOWN_MULTIPLIER);
    expect(user.listeningTypes).toEqual([]);
  });

  it('preserves identity, connection and IP', () => {
    const user = new FullUser('id-1', buildPrivateUser(), fakeWs, '10.0.0.1');
    expect(user.id).toBe('id-1');
    expect(user.connection).toBe(fakeWs);
    expect(user.ip).toBe('10.0.0.1');
  });

  it('defaults ip to "unknown" when not provided', () => {
    const user = new FullUser('id-1', buildPrivateUser(), fakeWs);
    expect(user.ip).toBe('unknown');
  });
});
