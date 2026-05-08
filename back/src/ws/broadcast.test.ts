import WS, { WebSocketServer } from 'ws';
import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import store from '../state/store.js';
import { broadcastAll, broadcastAllButSelf, broadcastToWorld, broadcastToWorldButSelf, setWebSocketServer } from './broadcast.js';

const makeWs = (readyState: number = WS.OPEN) => {
  const send = jest.fn();
  return { send, readyState } as unknown as WS & { send: jest.Mock };
};

const validMessage: Server.Message = {
  type: Server.MessageType.LOG,
  content: 'hi',
};

const setupServer = (clients: WS[]) => {
  setWebSocketServer({ clients: new Set(clients) } as unknown as WebSocketServer);
};

describe('broadcastAll', () => {
  it('sends the message to every client connected to the server', () => {
    const a = makeWs();
    const b = makeWs();
    setupServer([a, b]);
    broadcastAll(validMessage);
    expect(a.send).toHaveBeenCalledWith(JSON.stringify(validMessage));
    expect(b.send).toHaveBeenCalledWith(JSON.stringify(validMessage));
  });
});

describe('broadcastAllButSelf', () => {
  it('skips the sender connection and sends to everyone else', () => {
    const own = makeWs();
    const other = makeWs();
    setupServer([own, other]);
    const user = new FullUser(
      'id-1',
      {
        name: 'me',
        moderatorLevel: 0,
        isLoggedIn: false,
        isMobile: false,
        words: [],
        isBanned: false,
        xp: 0,
      },
      own,
      'ip',
    );
    broadcastAllButSelf(user, validMessage);
    expect(own.send).not.toHaveBeenCalled();
    expect(other.send).toHaveBeenCalled();
  });
});

describe('without a configured server', () => {
  it('throws when broadcasting before setWebSocketServer is called', () => {
    setWebSocketServer(undefined as unknown as WebSocketServer);
    expect(() => broadcastAll(validMessage)).toThrow('WebSocketServer not initialized');
  });
});

describe('world-scoped broadcasts', () => {
  const buildUser = (id: string, ws: WS, worldId: string) =>
    new FullUser(
      id,
      { name: id, moderatorLevel: 0, isLoggedIn: false, isMobile: false, words: [], isBanned: false, xp: 0 },
      ws,
      'ip',
      worldId,
    );

  beforeEach(() => {
    store.setState({ users: {} });
  });

  it('broadcastToWorld delivers only to clients whose user is in that world', () => {
    const wsA = makeWs();
    const wsB = makeWs();
    const wsC = makeWs();
    setupServer([wsA, wsB, wsC]);

    const userA = buildUser('a', wsA, 'fr');
    const userB = buildUser('b', wsB, 'fr');
    const userC = buildUser('c', wsC, 'ephem');
    store.setState({ users: { a: userA, b: userB, c: userC } });

    broadcastToWorld('fr', validMessage);

    expect(wsA.send).toHaveBeenCalled();
    expect(wsB.send).toHaveBeenCalled();
    expect(wsC.send).not.toHaveBeenCalled();
  });

  it('broadcastToWorldButSelf excludes the sender within the same world', () => {
    const wsA = makeWs();
    const wsB = makeWs();
    const wsC = makeWs();
    setupServer([wsA, wsB, wsC]);

    const userA = buildUser('a', wsA, 'ephem');
    const userB = buildUser('b', wsB, 'ephem');
    const userC = buildUser('c', wsC, 'fr');
    store.setState({ users: { a: userA, b: userB, c: userC } });

    broadcastToWorldButSelf(userA, validMessage);

    expect(wsA.send).not.toHaveBeenCalled();
    expect(wsB.send).toHaveBeenCalled();
    expect(wsC.send).not.toHaveBeenCalled();
  });

  it('broadcastToWorld does not throw when the world has no members', () => {
    const wsA = makeWs();
    setupServer([wsA]);
    const userA = buildUser('a', wsA, 'fr');
    store.setState({ users: { a: userA } });

    expect(() => broadcastToWorld('ephem', validMessage)).not.toThrow();
    expect(wsA.send).not.toHaveBeenCalled();
  });
});
