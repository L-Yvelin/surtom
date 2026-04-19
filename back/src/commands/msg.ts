import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { getTargetedUsers } from './targeting.js';
import { sendError, sendToUser } from '../ws/send.js';
import { validateText } from '../utils/validate.js';

export async function handleMsgCommand(user: FullUser, parts: string[]): Promise<void> {
  if (parts.length < 3) {
    sendError(user.connection, 'Utilisation : /msg pseudo message');
    return;
  }

  const targetUsername = parts[1];
  const messageText = parts.slice(2).join(' ');

  const targetedUsers = getTargetedUsers(targetUsername, user);
  if (targetedUsers.length === 0) return;

  if (!user.privateUser.moderatorLevel && !validateText(messageText)) {
    sendError(user.connection, 'Pseudo ou message invalide');
    return;
  }

  const timestamp = new Date().toISOString();

  targetedUsers.forEach((target) => {
    if (!target) return;

    sendToUser(target.connection, {
      type: Server.MessageType.MESSAGE,
      content: {
        type: Server.MessageType.PRIVATE_MESSAGE,
        content: {
          id: `pm-${Date.now()}`,
          user: { name: user.privateUser.name, moderatorLevel: user.privateUser.moderatorLevel },
          text: messageText,
          timestamp,
          deleted: 0,
        },
      },
    });

    sendToUser(user.connection, {
      type: Server.MessageType.MESSAGE,
      content: {
        type: Server.MessageType.PRIVATE_MESSAGE,
        content: {
          id: `pm-${Date.now()}-sent`,
          user: { name: target.privateUser.name, moderatorLevel: target.privateUser.moderatorLevel },
          text: messageText,
          timestamp,
          deleted: 0,
        },
      },
    });
  });
}
