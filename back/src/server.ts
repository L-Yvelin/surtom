import './config/env.js';
import { WebSocketServer } from 'ws';
import { env } from './config/env.js';
import { handleNewConnection } from './ws/connection.js';
import { setWebSocketServer } from './ws/broadcast.js';
import { subscribe } from './state/eventBus.js';
import { updateUsersList } from './handlers/userListHandler.js';
import { worldRegistry } from './state/worldRegistry.js';

console.log('SERVER STARTING...');

async function start(): Promise<void> {
  await worldRegistry.init();
  console.log(`Loaded ${worldRegistry.list().length} persistent world(s) from DB`);

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
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
