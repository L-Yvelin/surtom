import { Server } from '@surtom/interfaces';
import store from '../state/store.js';
import { mapFullUserToUser } from '../utils/mappers.js';
import { broadcastAll } from '../ws/broadcast.js';

export function updateUsersList(): void {
  const { users } = store.getState();
  const userList = Object.values(users)
    .filter((user) => user.privateUser.name)
    .reduce<Server.User[]>((acc, user) => {
      const existingUser = acc.find((u) => u.name === user.privateUser.name);
      if (!existingUser) {
        acc.push(mapFullUserToUser(user));
      }
      return acc;
    }, []);

  broadcastAll({
    type: Server.MessageType.USER_LIST,
    content: userList,
  });
}
