import WS from 'ws';
import { Server } from '@surtom/interfaces';
import { sendError, sendSuccess, sendToAll, sendToUser } from './send.js';

const makeWs = (readyState: number = WS.OPEN) => {
  const send = jest.fn();
  return { send, readyState } as unknown as WS & { send: jest.Mock };
};

const validMessage: Server.Message = {
  type: Server.MessageType.LOG,
  content: 'hello',
};

describe('sendToUser', () => {
  it('sends a serialized payload when the connection is OPEN', () => {
    const ws = makeWs(WS.OPEN);
    sendToUser(ws, validMessage);
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify(validMessage));
  });

  it('does not send when the connection is not OPEN', () => {
    const ws = makeWs(WS.CONNECTING);
    sendToUser(ws, validMessage);
    expect(ws.send).not.toHaveBeenCalled();
  });

  it('logs and skips when the message is invalid', () => {
    const ws = makeWs(WS.OPEN);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    sendToUser(ws, { type: 'NOPE', content: null } as unknown as Server.Message);
    expect(ws.send).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe('sendToAll', () => {
  it('sends to every OPEN client and skips others', () => {
    const open = makeWs(WS.OPEN);
    const closed = makeWs(WS.CLOSED);
    const connecting = makeWs(WS.CONNECTING);
    sendToAll(new Set([open, closed, connecting]), validMessage);
    expect(open.send).toHaveBeenCalledWith(JSON.stringify(validMessage));
    expect(closed.send).not.toHaveBeenCalled();
    expect(connecting.send).not.toHaveBeenCalled();
  });

  it('serializes the payload only once for the broadcast', () => {
    const a = makeWs(WS.OPEN);
    const b = makeWs(WS.OPEN);
    sendToAll(new Set([a, b]), validMessage);
    expect(a.send).toHaveBeenCalledWith(expect.any(String));
    expect(b.send).toHaveBeenCalledWith(expect.any(String));
    expect(a.send.mock.calls[0][0]).toBe(b.send.mock.calls[0][0]);
  });

  it('logs and skips invalid messages', () => {
    const ws = makeWs(WS.OPEN);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    sendToAll(new Set([ws]), { type: 'NOPE', content: null } as unknown as Server.Message);
    expect(ws.send).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe('sendError / sendSuccess', () => {
  it('wraps an error text into a MESSAGE/ERROR envelope', () => {
    const ws = makeWs(WS.OPEN);
    sendError(ws, 'oops');
    const payload = JSON.parse(ws.send.mock.calls[0][0]);
    expect(payload.type).toBe(Server.MessageType.MESSAGE);
    expect(payload.content.type).toBe(Server.MessageType.ERROR);
    expect(payload.content.content.text).toBe('oops');
    expect(typeof payload.content.content.timestamp).toBe('string');
  });

  it('wraps a success text into a MESSAGE/SUCCESS envelope', () => {
    const ws = makeWs(WS.OPEN);
    sendSuccess(ws, 'great');
    const payload = JSON.parse(ws.send.mock.calls[0][0]);
    expect(payload.type).toBe(Server.MessageType.MESSAGE);
    expect(payload.content.type).toBe(Server.MessageType.SUCCESS);
    expect(payload.content.content.text).toBe('great');
  });
});
