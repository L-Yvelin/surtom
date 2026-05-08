import { Server } from '@surtom/interfaces';
import store from '../state/store.js';
import { mapFullUserToUser } from '../utils/mappers.js';
import { broadcastToWorld } from '../ws/broadcast.js';

function buildWorldUserList(worldId: string): Server.User[] {
  const { users } = store.getState();
  return Object.values(users)
    .filter((user) => user.worldId === worldId && user.privateUser.name)
    .reduce<Server.User[]>((acc, user) => {
      const existingUser = acc.find((u) => u.name === user.privateUser.name);
      if (!existingUser) {
        acc.push(mapFullUserToUser(user));
      }
      return acc;
    }, []);
}

export function updateUsersListForWorld(worldId: string): void {
  broadcastToWorld(worldId, {
    type: Server.MessageType.USER_LIST,
    content: buildWorldUserList(worldId),
  });
}

export function updateUsersList(): void {
  const { users } = store.getState();
  const worldIds = new Set<string>();
  for (const user of Object.values(users)) {
    if (user.worldId) worldIds.add(user.worldId);
  }
  for (const worldId of worldIds) updateUsersListForWorld(worldId);
}
