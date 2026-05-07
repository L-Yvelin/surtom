import WS from 'ws';
import store from '../state/store.js';
import FullUser from '../models/FullUser.js';
import { dispatchCustomMessage } from './customType.js';

const makeWs = (readyState: number = WS.OPEN) => {
  const send = jest.fn();
  return { send, readyState } as unknown as WS & { send: jest.Mock };
};

const buildPrivateUser = (name: string) => ({
  name,
  moderatorLevel: 0,
  isLoggedIn: false,
  isMobile: false,
  words: [],
  isBanned: false,
  xp: 0,
});

describe('dispatchCustomMessage', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    store.setState({ users: {} });
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('forwards the payload to every user listening for that type', () => {
    const wsA = makeWs();
    const wsB = makeWs();
    const sender = new FullUser('id-0', buildPrivateUser('sender'), makeWs(), 'ip');

    const a = new FullUser('id-1', buildPrivateUser('alice'), wsA, 'ip');
    const b = new FullUser('id-2', buildPrivateUser('bob'), wsB, 'ip');
    a.listeningTypes.push('customType');
    b.listeningTypes.push('customType');

    store.setState({ users: { 'id-0': sender, 'id-1': a, 'id-2': b } });

    dispatchCustomMessage(sender, 'customType', { foo: 'bar' });

    const expected = JSON.stringify({ type: 'customType', content: { foo: 'bar' } });
    expect(wsA.send).toHaveBeenCalledWith(expected);
    expect(wsB.send).toHaveBeenCalledWith(expected);
  });

  it('does not send to users that are not listening for the type', () => {
    const ws = makeWs();
    const sender = new FullUser('id-0', buildPrivateUser('sender'), makeWs(), 'ip');
    const listener = new FullUser('id-1', buildPrivateUser('listener'), ws, 'ip');
    listener.listeningTypes.push('otherType');
    store.setState({ users: { 'id-0': sender, 'id-1': listener } });

    dispatchCustomMessage(sender, 'customType', {});

    expect(ws.send).not.toHaveBeenCalled();
  });

  it('skips listeners whose connection is not OPEN', () => {
    const closed = makeWs(WS.CLOSED);
    const sender = new FullUser('id-0', buildPrivateUser('sender'), makeWs(), 'ip');
    const listener = new FullUser('id-1', buildPrivateUser('listener'), closed, 'ip');
    listener.listeningTypes.push('customType');
    store.setState({ users: { 'id-0': sender, 'id-1': listener } });

    dispatchCustomMessage(sender, 'customType', {});

    expect(closed.send).not.toHaveBeenCalled();
  });

  it('logs an "empty" message when there are no listeners for the type', () => {
    const sender = new FullUser('id-0', buildPrivateUser('sender'), makeWs(), 'ip');
    store.setState({ users: { 'id-0': sender } });
    dispatchCustomMessage(sender, 'unknown', {});
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Wrong message type or empty (unknown)'));
  });
});
