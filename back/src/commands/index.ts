import FullUser from '../models/FullUser.js';
import { sendError } from '../ws/send.js';
import { handleNickCommand } from './nick.js';
import { handleLoginCommand } from './login.js';
import { handleRegisterCommand } from './register.js';
import { handleMsgCommand } from './msg.js';
import { handleAddTypeCommand } from './addtype.js';
import { handleRefreshCommand } from './refresh.js';
import { handleTellrawCommand } from './tellraw.js';
import { handleHelpCommand } from './help/handler.js';
import { handleGithubCommand } from './github.js';

export { getAvailableCommands } from './help/availableCommands.js';

type CommandHandler = (user: FullUser, parts: string[]) => void | Promise<void>;

const commands: Record<string, CommandHandler> = {
  nick: handleNickCommand,
  login: handleLoginCommand,
  register: handleRegisterCommand,
  msg: handleMsgCommand,
  addtype: handleAddTypeCommand,
  refresh: handleRefreshCommand,
  tellraw: handleTellrawCommand,
  help: handleHelpCommand,
  github: handleGithubCommand,
};

export async function handleCommand(user: FullUser, command: string): Promise<void> {
  const parts = command.split(' ');
  const name = parts[0].toLowerCase();

  const handler = commands[name];
  if (handler) {
    await handler(user, parts);
    return;
  }

  sendError(user.connection, 'Commande invalide !');
}
