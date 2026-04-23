import WS from 'ws';
import FullUser from '../models/FullUser.js';
import store from '../state/store.js';

export function dispatchCustomMessage(user: FullUser, messageType: string, messageContent: unknown): void {
  const listeningTypes = Object.values(store.getState().users).reduce<{ [key: string]: WS[] }>((acc, current) => {
    current.listeningTypes.forEach((type) => {
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(current.connection as WS);
    });
    return acc;
  }, {});

  const targets = listeningTypes[messageType];

  if (!targets) {
    console.log(`${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Wrong message type or empty (${messageType})`);
    return;
  }

  console.log(`${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Sent to custom type (${messageType})`);

  const payload = JSON.stringify({ type: messageType, content: messageContent });
  targets.forEach((connection) => {
    if (connection.readyState === WS.OPEN) {
      connection.send(payload);
    }
  });
}
