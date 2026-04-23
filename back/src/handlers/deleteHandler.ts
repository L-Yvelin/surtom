import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { toggleMessage } from '../repositories/messageRepository.js';
import { sendToUser } from '../ws/send.js';
import { broadcastAll } from '../ws/broadcast.js';

export async function handleDeleteMessage(user: FullUser, messageId: number): Promise<void> {
  if (!user.privateUser.moderatorLevel || isNaN(messageId)) return;

  try {
    const deleted = await toggleMessage(messageId, user.privateUser);

    if (deleted) {
      sendToUser(user.connection, {
        type: Server.MessageType.LOG,
        content: `Successfully deleted message with id ${messageId}`,
      });

      broadcastAll({
        type: Server.MessageType.DELETE_MESSAGE,
        content: messageId,
      });
    } else {
      sendToUser(user.connection, {
        type: Server.MessageType.LOG,
        content: `Failed to delete message with id ${messageId}`,
      });
    }
  } catch (err) {
    console.error('Error deleting message:', err);
  }
}
