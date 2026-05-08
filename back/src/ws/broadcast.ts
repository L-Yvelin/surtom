import WS, { WebSocketServer } from 'ws';
import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import store from '../state/store.js';
import { sendToAll } from './send.js';

let wssRef: WebSocketServer | null = null;

export function setWebSocketServer(wss: WebSocketServer): void {
  wssRef = wss;
}

function getClients(): Set<WS> {
  if (!wssRef) throw new Error('WebSocketServer not initialized');
  return wssRef.clients;
}

function clientsForWorld(worldId: string): WS[] {
  const users = store.getState().users;
  const matchingConnections = new Set<WS>();
  for (const user of Object.values(users)) {
    if (user.worldId === worldId) matchingConnections.add(user.connection);
  }
  return Array.from(getClients()).filter((c) => matchingConnections.has(c));
}

export function broadcastAll(message: Server.Message): void {
  sendToAll(getClients(), message);
}

export function broadcastAllButSelf(user: FullUser, message: Server.Message): void {
  const others = Array.from(getClients()).filter((client) => client !== user.connection);
  sendToAll(others, message);
}

export function broadcastToWorld(worldId: string, message: Server.Message): void {
  sendToAll(clientsForWorld(worldId), message);
}

export function broadcastToWorldButSelf(user: FullUser, message: Server.Message): void {
  if (!user.worldId) return;
  const others = clientsForWorld(user.worldId).filter((client) => client !== user.connection);
  sendToAll(others, message);
}
