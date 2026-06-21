import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { worldRegistry } from '../state/worldRegistry.js';
import { sendToUser } from '../ws/send.js';
import { broadcastToWorld } from '../ws/broadcast.js';

export async function handleDeleteMessage(user: FullUser, messageId: number): Promise<void> {
  if (isNaN(messageId) || !user.worldId) return;

  const world = worldRegistry.getOrDefault(user.worldId);

  try {
    const deleted = await world.toggleMessageDeleted(messageId, user.privateUser);

    if (deleted !== null) {
      sendToUser(user.connection, {
        type: Server.MessageType.LOG,
        content: `Successfully ${deleted ? 'deleted' : 'restored'} message with id ${messageId}`,
      });

      broadcastToWorld(world.id, {
        type: Server.MessageType.DELETE_MESSAGE,
        content: { id: messageId, deleted },
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
