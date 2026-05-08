import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { broadcastToWorld } from '../ws/broadcast.js';

export function handleIsTyping(user: FullUser): void {
  if (!user.worldId) return;
  broadcastToWorld(user.worldId, {
    type: Server.MessageType.IS_TYPING,
    content: user.privateUser.name,
  });
}
