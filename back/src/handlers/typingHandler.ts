import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { broadcastToWorldButSelf } from '../ws/broadcast.js';
import { TYPING_MIN_INTERVAL_MS } from '../config/constants.js';

export function handleIsTyping(user: FullUser): void {
  if (!user.worldId) return;
  const now = Date.now();
  if (now - user.lastTypingAt < TYPING_MIN_INTERVAL_MS) return;
  user.lastTypingAt = now;
  broadcastToWorldButSelf(user, {
    type: Server.MessageType.IS_TYPING,
    content: user.privateUser.name,
  });
}
