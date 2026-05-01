import { Server } from '@surtom/interfaces';
import FullUser from '../../models/FullUser.js';
import { sendError, sendToUser } from '../../ws/send.js';
import { getAvailableCommands } from './availableCommands.js';
import { cibleExplanation, cycleHistory, helpHeader, markdownExplanation, utilisezEmojis } from './helpContent.js';

type ColoredText = { text: string; color: string };

export function handleHelpCommand(user: FullUser, parts: string[]): void {
  if (parts.length !== 1) {
    sendError(user.connection, 'Utilisation : /help');
    return;
  }

  const formatted: ColoredText[] = [...helpHeader];

  for (const [command, description] of Object.entries(getAvailableCommands(!!user.privateUser.moderatorLevel))) {
    formatted.push({ text: `${command} : `, color: 'darkkhaki' });
    formatted.push({ text: `${description}\n`, color: 'lemonchiffon' });
  }

  formatted.push(...cibleExplanation, ...markdownExplanation, ...utilisezEmojis, ...cycleHistory);

  sendToUser(user.connection, {
    type: Server.MessageType.MESSAGE,
    content: {
      type: Server.MessageType.ENHANCED,
      content: {
        text: JSON.stringify(formatted),
        timestamp: new Date().toISOString(),
        id: '-1',
        user: { name: 'System', moderatorLevel: Server.ModeratorLevel.System },
        deleted: 0,
      },
    },
  });
}
