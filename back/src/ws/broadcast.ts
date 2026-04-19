import WS, { WebSocketServer } from 'ws';
import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { sendToAll } from './send.js';

let wssRef: WebSocketServer | null = null;

export function setWebSocketServer(wss: WebSocketServer): void {
  wssRef = wss;
}

function getClients(): Set<WS> {
  if (!wssRef) throw new Error('WebSocketServer not initialized');
  return wssRef.clients;
}

export function broadcastAll(message: Server.Message): void {
  sendToAll(getClients(), message);
}

export function broadcastAllButSelf(user: FullUser, message: Server.Message): void {
  const others = Array.from(getClients()).filter((client) => client !== user.connection);
  sendToAll(others, message);
}
