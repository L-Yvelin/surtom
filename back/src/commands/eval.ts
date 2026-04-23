import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { getTargetedUsers } from './targeting.js';
import { sendError, sendToUser } from '../ws/send.js';

export async function handleEvalCommand(user: FullUser, parts: string[]): Promise<void> {
  if (!user.privateUser.moderatorLevel) {
    sendError(user.connection, '¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿');
    return;
  }

  if (parts.length < 3) {
    sendError(user.connection, 'Utilisation : /eval pseudo ¿¿¿¿¿');
    return;
  }

  const targetUsername = parts[1];
  const messageText = parts.slice(2).join(' ');

  if (/cookie/i.test(messageText)) {
    sendError(user.connection, 'Pas touche aux 🍪 !');
    return;
  }

  const targetedUsers = getTargetedUsers(targetUsername, user);
  if (targetedUsers.length === 0) return;

  targetedUsers.forEach((target) => {
    sendToUser(target.connection, {
      type: Server.MessageType.EVAL,
      content: messageText,
    });
  });
}
