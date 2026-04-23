import WS from 'ws';
import { Server, validateServerMessage } from '@surtom/interfaces';

export function sendToUser(connection: WS, message: Server.Message): void {
  if (!validateServerMessage(message)) {
    console.error('Attempted to send invalid message:', JSON.stringify(message));
    return;
  }
  if (connection.readyState === WS.OPEN) {
    connection.send(JSON.stringify(message));
  }
}

export function sendToAll(clients: Set<WS> | Iterable<WS>, message: Server.Message): void {
  if (!validateServerMessage(message)) {
    console.error('Attempted to broadcast invalid message:', JSON.stringify(message));
    return;
  }
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WS.OPEN) {
      client.send(payload);
    }
  }
}

export function sendError(connection: WS, text: string): void {
  sendToUser(connection, {
    type: Server.MessageType.MESSAGE,
    content: {
      type: Server.MessageType.ERROR,
      content: { text, timestamp: new Date().toISOString() },
    },
  });
}

export function sendSuccess(connection: WS, text: string): void {
  sendToUser(connection, {
    type: Server.MessageType.MESSAGE,
    content: {
      type: Server.MessageType.SUCCESS,
      content: { text, timestamp: new Date().toISOString() },
    },
  });
}
