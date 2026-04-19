import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import store from '../state/store.js';
import { getTargetedUsers } from './targeting.js';
import { sendError, sendSuccess, sendToUser } from '../ws/send.js';
import { isJson, validateUsername } from '../utils/validate.js';

export async function handleTellrawCommand(user: FullUser, parts: string[]): Promise<void> {
  if (!user.privateUser.moderatorLevel) {
    sendError(user.connection, "Vous n'êtes pas autorisé à utiliser cette commande.");
    return;
  }

  let normalizedParts = parts;

  if (normalizedParts.length > 2) {
    if (!validateUsername(normalizedParts[1]) && !/[@][a-z]/.test(normalizedParts[1])) {
      const merged = normalizedParts.slice(1).join(' ');
      normalizedParts = [normalizedParts[0], merged];
    } else {
      const merged = normalizedParts.slice(2).join(' ');
      normalizedParts = [normalizedParts[0], normalizedParts[1], merged];
    }
  }

  if (!isJson(normalizedParts[normalizedParts.length - 1])) {
    sendError(user.connection, "L'objet JSON est invalide.");
    return;
  }

  let targetedUsers: FullUser[] = [];
  let message = '';

  if (normalizedParts.length === 2) {
    targetedUsers = Object.values(store.getState().users);
    message = normalizedParts[1];
  } else if (normalizedParts.length === 3) {
    targetedUsers = getTargetedUsers(normalizedParts[1], user);
    message = normalizedParts[2];
    if (targetedUsers.length === 0) return;
  } else {
    sendError(user.connection, 'Utilisation : /tellraw target message');
    return;
  }

  targetedUsers.forEach((target) => {
    if (target.connection) {
      sendToUser(target.connection, {
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ENHANCED,
          content: {
            text: message,
            timestamp: new Date().toISOString(),
            id: '-1',
            user: { name: user.privateUser.name, moderatorLevel: user.privateUser.moderatorLevel },
            deleted: 0,
          },
        },
      });
    }
    sendSuccess(user.connection, `Message envoyé à ${target.privateUser.name}`);
  });
}
