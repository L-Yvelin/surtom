import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { sendError, sendToUser } from '../ws/send.js';

export async function handleGithubCommand(user: FullUser, parts: string[]): Promise<void> {
  if (parts.length !== 1) {
    sendError(user.connection, 'Utilisation : /github');
  } else {
    const message = {
      text: 'Surtom est un projet open source ! Tu peux trouver le code ici : https://github.com/L-Yvelin/surtom',
      // https://brand.github.com/foundations/colors/
      color: '#0FBF3E',
    };
    sendToUser(user.connection, {
      type: Server.MessageType.MESSAGE,
      content: {
        type: Server.MessageType.ENHANCED,
        content: {
          text: JSON.stringify(message),
          timestamp: new Date().toISOString(),
          id: '-1',
          user: { name: 'System', moderatorLevel: 2 },
          deleted: 0,
        },
      },
    });
  }
}
