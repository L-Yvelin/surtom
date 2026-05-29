import { Client } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { handleCommand } from '../commands/index.js';
import { handleChatMessage } from '../handlers/chatHandler.js';
import { handleDeleteMessage } from '../handlers/deleteHandler.js';
import { handleTryMessage } from '../handlers/tryHandler.js';
import { handleCursorPosition } from '../handlers/cursorHandler.js';
import { handleIsTyping } from '../handlers/typingHandler.js';
import { handleJoinWorld } from '../handlers/joinWorldHandler.js';
import { handleLeaveWorld } from '../handlers/leaveWorldHandler.js';
import { handleListWorlds } from '../handlers/listWorldsHandler.js';
import { dispatchCustomMessage } from './customType.js';
import { RATE_LIMIT_FREE_MESSAGES, COOLDOWN_INITIAL_SECONDS } from '../config/constants.js';

const SILENT_MESSAGE_TYPES = new Set<Client.MessageType>([
  Client.MessageType.PING,
  Client.MessageType.IS_TYPING,
  Client.MessageType.CURSOR_POSITION,
]);

const RATE_EXEMPT_TYPES = new Set<Client.MessageType>([
  Client.MessageType.IS_TYPING,
  Client.MessageType.CURSOR_POSITION,
  Client.MessageType.JOIN_WORLD,
  Client.MessageType.LEAVE_WORLD,
  Client.MessageType.LIST_WORLDS,
]);

export function shouldLogMessage(type: Client.MessageType): boolean {
  return !SILENT_MESSAGE_TYPES.has(type);
}

function isRateLimited(user: FullUser, type: Client.MessageType): boolean {
  if (user.privateUser.moderatorLevel) return false;
  if (RATE_EXEMPT_TYPES.has(type)) return false;

  user.messageCount++;

  if (user.messageCount > RATE_LIMIT_FREE_MESSAGES && user.lastMessageTimestamp !== null) {
    const timeSinceLastMessage = Date.now() - new Date(user.lastMessageTimestamp).getTime();
    if (timeSinceLastMessage < user.messageCooldown * 1000) {
      user.messageCooldown *= user.cooldownMultiplier;
      console.log(`${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Message cooldown in effect`);
      return true;
    }
    user.messageCooldown = COOLDOWN_INITIAL_SECONDS;
  }

  user.lastMessageTimestamp = new Date().toISOString();
  return false;
}

export async function handleMessage(user: FullUser, message: Client.Message): Promise<void> {
  if (message.type === Client.MessageType.PING) return;

  if (message.type === Client.MessageType.CHAT_MESSAGE && message.content.text.startsWith('/')) {
    const command = message.content.text.slice(1).trim();
    await handleCommand(user, command);
    return;
  }

  if (isRateLimited(user, message.type)) return;

  switch (message.type) {
    case Client.MessageType.CHAT_MESSAGE:
    case Client.MessageType.SCORE_TO_CHAT:
      await handleChatMessage(user, message);
      break;
    case Client.MessageType.DELETE_MESSAGE:
      await handleDeleteMessage(user, message.content);
      break;
    case Client.MessageType.IS_TYPING:
      handleIsTyping(user);
      break;
    case Client.MessageType.TRY:
      await handleTryMessage(user, message.content);
      break;
    case Client.MessageType.CURSOR_POSITION:
      handleCursorPosition(user, message.content.cursor);
      break;
    case Client.MessageType.JOIN_WORLD:
      await handleJoinWorld(user, message.content);
      break;
    case Client.MessageType.LEAVE_WORLD:
      handleLeaveWorld(user);
      break;
    case Client.MessageType.LIST_WORLDS:
      handleListWorlds(user);
      break;
    default: {
      const unknown = message as { type: string; content: unknown };
      dispatchCustomMessage(user, unknown.type, unknown.content);
      break;
    }
  }
}
