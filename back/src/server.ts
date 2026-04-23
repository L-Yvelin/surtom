import './config/env.js';
import { WebSocketServer } from 'ws';
import { env } from './config/env.js';
import { handleNewConnection } from './ws/connection.js';
import { setWebSocketServer } from './ws/broadcast.js';
import { subscribe } from './state/eventBus.js';
import { updateUsersList } from './handlers/userListHandler.js';

console.log('SERVER STARTING...');

const wss = new WebSocketServer({ port: env.port });
setWebSocketServer(wss);

subscribe('updateUsersList', () => updateUsersList());

wss.on('error', (err) => {
  console.error('Websocket error:', err);
});

wss.on('listening', () => {
  console.log(`Websocket server listening on port ${env.port}`);
});

wss.on('connection', (connection, req) => {
  void handleNewConnection(connection, req);
});
