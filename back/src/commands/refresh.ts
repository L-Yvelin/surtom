import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { getTargetedUsers } from './targeting.js';
import { getMessages } from '../repositories/messageRepository.js';
import { sendError, sendSuccess, sendToUser } from '../ws/send.js';
import { MAX_MESSAGES_LOADED } from '../config/constants.js';

export async function handleRefreshCommand(user: FullUser, parts: string[]): Promise<void> {
  let targetedUsers: FullUser[] = [];

  if (parts.length === 1) {
    targetedUsers.push(user);
  } else if (parts.length === 2) {
    if (!user.privateUser.moderatorLevel) {
      sendError(user.connection, "Vous n'êtes pas autorisé à utiliser cette commande.");
      return;
    }
    targetedUsers = getTargetedUsers(parts[1], user);
    if (targetedUsers.length === 0) return;
  } else {
    sendError(user.connection, 'Utilisation : /refresh target?');
    return;
  }

  try {
    await Promise.all(
      targetedUsers.map(async (target) => {
        if (!target.connection || !target.worldId) return;
        const dbMessages = await getMessages(
          target.worldId,
          !!user.privateUser.moderatorLevel,
          MAX_MESSAGES_LOADED,
          !user.privateUser.isLoggedIn,
        );

        if (!dbMessages) return;

        const filtered = dbMessages.filter(
          (msg) =>
            msg.type === Server.MessageType.TEXT || msg.type === Server.MessageType.ENHANCED || msg.type === Server.MessageType.SCORE,
        ) as Server.ChatMessage.SavedType[];

        sendToUser(target.connection, {
          type: Server.MessageType.GET_MESSAGES,
          content: filtered,
        });
        sendSuccess(target.connection, 'Chat rafraîchi !');
      }),
    );

    console.log(`${new Date().toISOString()} (${user.id}) User refreshed messages: ${user.privateUser.name}`);
  } catch (err) {
    console.error('Error getting messages:', err);
  }
}
