import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { sendError, sendToUser } from '../ws/send.js';
import { findSecretCommand } from './secret.js';
import { handleNickCommand } from './nick.js';
import { handleLoginCommand } from './login.js';
import { handleRegisterCommand } from './register.js';
import { handleMsgCommand } from './msg.js';
import { handleEvalCommand } from './eval.js';
import { handleAddTypeCommand } from './addtype.js';
import { handleRefreshCommand } from './refresh.js';
import { handleTellrawCommand } from './tellraw.js';
import { handleHelpCommand } from './help/handler.js';

export { getAvailableCommands } from './help/availableCommands.js';

type CommandHandler = (user: FullUser, parts: string[]) => void | Promise<void>;

const commands: Record<string, CommandHandler> = {
  nick: handleNickCommand,
  login: handleLoginCommand,
  register: handleRegisterCommand,
  msg: handleMsgCommand,
  eval: handleEvalCommand,
  addtype: handleAddTypeCommand,
  refresh: handleRefreshCommand,
  tellraw: handleTellrawCommand,
  help: handleHelpCommand,
};

export async function handleCommand(user: FullUser, command: string): Promise<void> {
  const parts = command.split(' ');
  const name = parts[0].toLowerCase();

  const handler = commands[name];
  if (handler) {
    await handler(user, parts);
    return;
  }

  const secret = findSecretCommand(name);
  if (secret) {
    sendToUser(user.connection, {
      type: Server.MessageType.EVAL,
      content: secret.payload.replace('{{command}}', name),
    });
    return;
  }

  sendError(user.connection, 'Commande invalide !');
}
