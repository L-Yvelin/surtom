import { CursorPosition, Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { mapFullUserToUser } from '../utils/mappers.js';
import { broadcastToWorldButSelf } from '../ws/broadcast.js';

export function handleCursorPosition(user: FullUser, cursor: CursorPosition): void {
  broadcastToWorldButSelf(user, {
    type: Server.MessageType.CURSOR_POSITION,
    content: {
      user: mapFullUserToUser(user),
      cursor: { x: cursor.x, y: cursor.y },
    },
  });
}
