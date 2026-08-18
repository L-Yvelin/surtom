/** @jest-environment jsdom */
jest.mock('js-cookie', () => ({ __esModule: true, default: { set: jest.fn(), get: jest.fn() } }));
jest.mock('react-device-detect', () => ({ __esModule: true, isMobile: false }));

const handleServerMessage = jest.fn();
jest.mock('./wsMessageHandler', () => ({ __esModule: true, handleServerMessage: (...args: unknown[]) => handleServerMessage(...args) }));

import { Server } from '@surtom/interfaces';

class FakeWebSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = FakeWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onclose: (() => void) | null = null;
  send = jest.fn();
  url: string;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.();
  }

  static instances: FakeWebSocket[] = [];
}

describe('useWebSocketStore', () => {
  let useWebSocketStore: typeof import('./useWebSocketStore').useWebSocketStore;

  beforeEach(async () => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.clearAllMocks();
    FakeWebSocket.instances = [];
    (global as unknown as { WebSocket: unknown }).WebSocket = FakeWebSocket;
    process.env.VITE_WEBSOCKET_PROTOCOL = 'ws';
    process.env.VITE_WEBSOCKET_HOST = 'example.test';
    delete process.env.VITE_WEBSOCKET_PORT;
    delete process.env.VITE_WEBSOCKET_PATH;
    ({ useWebSocketStore } = await import('./useWebSocketStore'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('connect() opens a socket at the configured URL and flips isConnected on open', () => {
    useWebSocketStore.getState().connect();
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(FakeWebSocket.instances[0].url).toBe('ws://example.test');
    expect(useWebSocketStore.getState().isConnecting).toBe(true);

    FakeWebSocket.instances[0].readyState = FakeWebSocket.OPEN;
    FakeWebSocket.instances[0].onopen?.();
    expect(useWebSocketStore.getState().isConnected).toBe(true);
    expect(useWebSocketStore.getState().isConnecting).toBe(false);
  });

  test('connect() is a no-op while a connection is already open or connecting', () => {
    useWebSocketStore.getState().connect();
    useWebSocketStore.getState().connect();
    expect(FakeWebSocket.instances).toHaveLength(1);

    FakeWebSocket.instances[0].readyState = FakeWebSocket.OPEN;
    useWebSocketStore.getState().connect();
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('routes a valid parsed message to handleServerMessage', () => {
    useWebSocketStore.getState().connect();
    const socket = FakeWebSocket.instances[0];
    const message: Server.Message = { type: Server.MessageType.STATS, content: { '1': 2 } };

    socket.onmessage?.({ data: JSON.stringify(message) });

    expect(handleServerMessage).toHaveBeenCalledWith(message, expect.anything());
  });

  test('drops a message that fails server-message validation', () => {
    useWebSocketStore.getState().connect();
    FakeWebSocket.instances[0].onmessage?.({ data: JSON.stringify({ type: 'bogus', content: {} }) });
    expect(handleServerMessage).not.toHaveBeenCalled();
  });

  test('drops an unparseable message without throwing', () => {
    useWebSocketStore.getState().connect();
    expect(() => FakeWebSocket.instances[0].onmessage?.({ data: 'not json' })).not.toThrow();
    expect(handleServerMessage).not.toHaveBeenCalled();
  });

  test('sendMessage only writes to the socket while it is OPEN', () => {
    useWebSocketStore.getState().connect();
    const socket = FakeWebSocket.instances[0];

    useWebSocketStore.getState().sendMessage({ type: 'anything' } as never);
    expect(socket.send).not.toHaveBeenCalled();

    socket.readyState = FakeWebSocket.OPEN;
    useWebSocketStore.getState().sendMessage({ type: 'anything' } as never);
    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'anything' }));
  });

  test('onclose resets connection flags and schedules exactly one reconnect attempt', () => {
    useWebSocketStore.getState().connect();
    const socket = FakeWebSocket.instances[0];
    socket.readyState = FakeWebSocket.OPEN;
    socket.onopen?.();

    socket.close();
    expect(useWebSocketStore.getState().isConnected).toBe(false);
    expect(useWebSocketStore.getState().isReady).toBe(false);
    expect(useWebSocketStore.getState().ws).toBeNull();

    // A second close/error in the same window must not schedule a duplicate reconnect timer.
    socket.onclose?.();

    jest.advanceTimersByTime(2000);
    expect(FakeWebSocket.instances).toHaveLength(2);
  });

  test('disconnect() clears the reconnect timer so no reconnection happens afterwards', () => {
    useWebSocketStore.getState().connect();
    const socket = FakeWebSocket.instances[0];
    socket.readyState = FakeWebSocket.OPEN;
    socket.onopen?.();

    useWebSocketStore.getState().disconnect();
    expect(useWebSocketStore.getState().isConnected).toBe(false);
    expect(useWebSocketStore.getState().isReady).toBe(false);
    expect(useWebSocketStore.getState().ws).toBeNull();

    jest.advanceTimersByTime(5000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });
});
