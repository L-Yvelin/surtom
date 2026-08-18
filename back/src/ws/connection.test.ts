import { EventEmitter } from 'events';
import type WS from 'ws';
import type { IncomingMessage } from 'http';

jest.mock('../repositories/playerRepository.js', () => ({
  __esModule: true,
  getPlayerBySessionHash: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../repositories/chatReadRepository.js', () => ({
  __esModule: true,
  getChatLastRead: jest.fn(),
}));
jest.mock('../repositories/xpRepository.js', () => ({
  __esModule: true,
  getPlayerXp: jest.fn().mockResolvedValue(0),
}));
jest.mock('../handlers/userListHandler.js', () => ({
  __esModule: true,
  updateUsersListForWorld: jest.fn(),
}));
jest.mock('./cookies.js', () => ({
  __esModule: true,
  parseCookies: jest.fn(() => ({})),
}));
jest.mock('../utils/crypto.js', () => ({
  __esModule: true,
  generateRandomHash: jest.fn(() => 'id-1'),
}));
jest.mock('../utils/randomName.js', () => ({
  __esModule: true,
  getRandomFunnyName: jest.fn(() => 'Alice'),
}));
jest.mock('./send.js', () => ({
  __esModule: true,
  sendToUser: jest.fn(),
}));
jest.mock('./dispatcher.js', () => ({
  __esModule: true,
  handleMessage: jest.fn(),
  shouldLogMessage: jest.fn(() => true),
}));

import { updateUsersListForWorld } from '../handlers/userListHandler.js';
import store from '../state/store.js';
import { worldRegistry, DEFAULT_WORLD_ID } from '../state/worldRegistry.js';
import { handleNewConnection } from './connection.js';
import { PING_INTERVAL_MS } from '../config/constants.js';

type FakeConnection = WS & EventEmitter & { terminate: jest.Mock; ping: jest.Mock };

function makeFakeConnection(): FakeConnection {
  const emitter = new EventEmitter() as unknown as FakeConnection;
  emitter.terminate = jest.fn();
  emitter.ping = jest.fn();
  return emitter;
}

function makeReq(): IncomingMessage {
  return { headers: {}, socket: { remoteAddress: '1.2.3.4' } } as unknown as IncomingMessage;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  worldRegistry.resetForTests();
  store.setState({ users: {} });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('handleNewConnection', () => {
  it('registers the new connection in the store', async () => {
    const conn = makeFakeConnection();
    await handleNewConnection(conn, makeReq());
    expect(Object.keys(store.getState().users)).toHaveLength(1);
  });

  it('pings on the first heartbeat tick and does not terminate a connection that is still alive', async () => {
    const conn = makeFakeConnection();
    await handleNewConnection(conn, makeReq());

    jest.advanceTimersByTime(PING_INTERVAL_MS);

    expect(conn.ping).toHaveBeenCalledTimes(1);
    expect(conn.terminate).not.toHaveBeenCalled();
  });

  it('terminates the connection and refreshes the world user list when no pong arrives before the next tick', async () => {
    const conn = makeFakeConnection();
    await handleNewConnection(conn, makeReq());
    const [user] = Object.values(store.getState().users);
    user.worldId = DEFAULT_WORLD_ID;

    jest.advanceTimersByTime(PING_INTERVAL_MS); // ping sent, isAlive flips to false
    jest.advanceTimersByTime(PING_INTERVAL_MS); // still no pong -> dead

    expect(conn.terminate).toHaveBeenCalledTimes(1);
    expect(updateUsersListForWorld).toHaveBeenCalledWith(DEFAULT_WORLD_ID);
  });

  it('does not terminate when a pong arrives between heartbeat ticks', async () => {
    const conn = makeFakeConnection();
    await handleNewConnection(conn, makeReq());

    jest.advanceTimersByTime(PING_INTERVAL_MS);
    conn.emit('pong');
    jest.advanceTimersByTime(PING_INTERVAL_MS);

    expect(conn.terminate).not.toHaveBeenCalled();
  });

  it('cleans up the store entry and world membership exactly once on close', async () => {
    const conn = makeFakeConnection();
    await handleNewConnection(conn, makeReq());
    const [user] = Object.values(store.getState().users);
    user.worldId = DEFAULT_WORLD_ID;
    worldRegistry.getOrDefault(DEFAULT_WORLD_ID).addMember(user.id);

    conn.emit('close');

    expect(store.getState().users[user.id]).toBeUndefined();
    expect(worldRegistry.getOrDefault(DEFAULT_WORLD_ID).hasMember(user.id)).toBe(false);
    expect(updateUsersListForWorld).toHaveBeenCalledTimes(1);
    expect(updateUsersListForWorld).toHaveBeenCalledWith(DEFAULT_WORLD_ID);
  });

  it('does not touch world membership on close when the user never joined a world', async () => {
    const conn = makeFakeConnection();
    await handleNewConnection(conn, makeReq());

    conn.emit('close');

    expect(updateUsersListForWorld).not.toHaveBeenCalled();
  });
});
