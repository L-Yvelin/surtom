import { Server } from '@surtom/interfaces';
import { isSavedChatMessage } from './messageFormatting';

export function isOthersChatMessage(message: Server.ChatMessage.Type, selfName: string): boolean {
  return isSavedChatMessage(message) && message.content.user.name !== selfName;
}

export function isUnreadMessage(message: Server.ChatMessage.Type, lastReadAt: string | null, selfName: string): boolean {
  if (!lastReadAt || !isOthersChatMessage(message, selfName)) return false;
  return new Date((message as Server.ChatMessage.SavedType).content.timestamp).getTime() > new Date(lastReadAt).getTime();
}

export function hasUnreadMessages(messages: Server.ChatMessage.Type[], lastReadAt: string | null, selfName: string): boolean {
  return messages.some((message) => isUnreadMessage(message, lastReadAt, selfName));
}

export function findFirstUnreadId(messages: Server.ChatMessage.Type[], lastReadAt: string | null, selfName: string): string | null {
  for (const message of messages) {
    if (isUnreadMessage(message, lastReadAt, selfName) && isSavedChatMessage(message)) {
      return message.content.id;
    }
  }
  return null;
}
