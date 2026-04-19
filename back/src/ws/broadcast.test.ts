import WS, { WebSocketServer } from 'ws';
import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { broadcastAll, broadcastAllButSelf, setWebSocketServer } from './broadcast.js';

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
