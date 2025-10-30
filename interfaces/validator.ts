import { Server, Client } from './Message';

function exhaustiveCheck(x: never): never {
  throw new Error('Unhandled case: ' + x);
}

function isUser(user: any): boolean {
  return user && typeof user === 'object' && typeof user.name === 'string' && typeof user.moderatorLevel === 'number';
}

function isTextContent(content: any): boolean {
  return (
    content &&
    typeof content === 'object' &&
    typeof content.text === 'string' &&
    typeof content.id === 'string' &&
    typeof content.timestamp === 'string' &&
    typeof content.deleted === 'number' &&
    isUser(content.user)
  );
}

function isClientScoreContent(content: any): boolean {
  return (
    content &&
    typeof content === 'object' &&
    (typeof content.custom === 'undefined' || typeof content.custom === 'string') &&
    Array.isArray(content.attempts) &&
    content.attempts.every((row: any) => Array.isArray(row) && row.every((cell: any) => typeof cell === 'string'))
  );
}

function isServerScoreContent(content: any): boolean {
  return (
    content &&
    typeof content === 'object' &&
    typeof content.answer === 'string' &&
    Array.isArray(content.attempts) &&
    typeof content.id === 'string' &&
    typeof content.timestamp === 'string' &&
    typeof content.deleted === 'number' &&
    isUser(content.user)
  );
}

function isStatusContent(content: any): boolean {
  return content && typeof content === 'object' && typeof content.text === 'string' && typeof content.timestamp === 'string';
}

function isLoginMessage(content: any): boolean {
  return (
    content &&
    typeof content.user === 'object' &&
    typeof content.user.name === 'string' &&
    typeof content.user.moderatorLevel === 'number' &&
    typeof content.user.xp === 'number' &&
    typeof content.user.isMobile === 'boolean' &&
    typeof content.user.isLoggedIn === 'boolean' &&
    (typeof content.sessionHash === 'undefined' || typeof content.sessionHash === 'string')
  );
}

function isServerUser(user: any): boolean {
  return (
    user &&
    typeof user === 'object' &&
    typeof user.name === 'string' &&
    typeof user.moderatorLevel === 'number' &&
    typeof user.xp === 'number' &&
    typeof user.isMobile === 'boolean' &&
    typeof user.isLoggedIn === 'boolean'
  );
}

function isSavedType(obj: any): boolean {
  if (!obj || typeof obj !== 'object' || typeof obj.type !== 'string') return false;
  switch (obj.type) {
    case Server.MessageType.TEXT:
    case Server.MessageType.PRIVATE_MESSAGE:
    case Server.MessageType.ENHANCED:
      return isTextContent(obj.content);
    case Server.MessageType.SCORE:
      return isServerScoreContent(obj.content);
    default:
      return false;
  }
}

/**
 * Validates if a given object is a properly formatted Server.Message.
 * Returns true if valid, false otherwise.
 */
export function validateServerMessage(msg: Server.Message): boolean {
  const t = msg.type;
  switch (t) {
    case Server.MessageType.DELETE_MESSAGE:
      return typeof msg.content === 'number';
    case Server.MessageType.GET_MESSAGES:
      return Array.isArray(msg.content) && msg.content.every(isSavedType);
    case Server.MessageType.USER_LIST:
      return Array.isArray(msg.content) && msg.content.every(isServerUser);
    case Server.MessageType.IS_TYPING:
      return typeof msg.content === 'string';
    case Server.MessageType.LAST_TIME_MESSAGE:
      return typeof msg.content === 'string';
    case Server.MessageType.LOG:
      return typeof msg.content === 'string';
    case Server.MessageType.EVAL:
      return typeof msg.content === 'string';
    case Server.MessageType.MESSAGE:
      if (!msg.content || typeof msg.content !== 'object' || typeof (msg.content as any).type !== 'string') return false;
      const innerType: Server.ChatMessage.Type['type'] = (msg.content as any).type;
      switch (innerType) {
        case Server.MessageType.TEXT:
        case Server.MessageType.PRIVATE_MESSAGE:
        case Server.MessageType.ENHANCED:
          return isTextContent((msg.content as any).content);
        case Server.MessageType.SCORE:
          return isServerScoreContent((msg.content as any).content);
        case Server.MessageType.SUCCESS:
        case Server.MessageType.ERROR:
          return isStatusContent((msg.content as any).content);
        default:
          return exhaustiveCheck(innerType);
      }
    case Server.MessageType.STATS:
      return typeof msg.content === 'object' && msg.content !== null;
    case Server.MessageType.LOGIN:
      return isLoginMessage(msg.content);
    case Server.MessageType.DAILY_WORDS:
      return (
        msg.content.words &&
        Array.isArray(msg.content.words) &&
        msg.content.words.every((w: any) => typeof w === 'string') &&
        msg.content.attempts &&
        Array.isArray(msg.content.attempts) &&
        msg.content.attempts.every((w: any) => typeof w === 'string' && w.length > 0)
      );
    case Server.MessageType.ATTEMPT:
      return typeof msg.content === 'string';
    default:
      return exhaustiveCheck(t);
  }
}

function isTextChatMessageContent(content: any): boolean {
  return (
    content &&
    typeof content === 'object' &&
    typeof content.text === 'string' &&
    (typeof content.imageData === 'undefined' || typeof content.imageData === 'string') &&
    (typeof content.replyId === 'undefined' || typeof content.replyId === 'string')
  );
}

/**
 * Validates if a given object is a properly formatted Client.Message.
 * Returns true if valid, false otherwise.
 */
export function validateClientMessage(msg: Client.Message): boolean {
  const t = msg.type;
  switch (t) {
    case Client.MessageType.DELETE_MESSAGE:
      return typeof msg.content === 'number';
    case Client.MessageType.IS_TYPING:
      return true;
    case Client.MessageType.PING:
      return true;
    case Client.MessageType.CHAT_MESSAGE:
      return isTextChatMessageContent(msg.content);
    case Client.MessageType.SCORE_TO_CHAT:
      return isClientScoreContent(msg.content);
    case Client.MessageType.TRY:
      return typeof msg.content === 'string';
    default:
      return exhaustiveCheck(t);
  }
}
