import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { broadcastAll } from '../ws/broadcast.js';

export function handleIsTyping(user: FullUser): void {
  broadcastAll({
    type: Server.MessageType.IS_TYPING,
    content: user.privateUser.name,
  });
}
