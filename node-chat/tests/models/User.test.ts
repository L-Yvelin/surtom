import User from '../src/models/User';
import { WebSocket } from 'ws';

describe('User', () => {
  let mockConnection: WebSocket;

  beforeEach(() => {
    mockConnection = { send: jest.fn(), readyState: WebSocket.OPEN } as unknown as WebSocket;
  });

  it('should create a user with default values', () => {
    const user = new User('1', 'testUser', false, mockConnection);
    expect(user.id).toBe('1');
    expect(user.name).toBe('testUser');
    expect(user.isModerator).toBe(false);
    expect(user.connection).toBe(mockConnection);
    expect(user.messageCount).toBe(0);
    expect(user.lastMessageTimestamp).toBeNull();
    expect(user.messageCooldown).toBe(1);
    expect(user.cooldownMultiplier).toBe(2);
    expect(user.sentTheScore).toBe(false);
    expect(user.listeningTypes).toEqual(new Set());
    expect(user.ip).toBe('unknown');
    expect(user.isLoggedIn).toBe(false);
    expect(user.mobileDevice).toBe(false);
  });

  it('should create a user with custom values', () => {
    const user = new User('1', 'testUser', true, mockConnection, '127.0.0.1', true, true);
    expect(user.ip).toBe('127.0.0.1');
    expect(user.isLoggedIn).toBe(true);
    expect(user.mobileDevice).toBe(true);
  });
});
