import FullUser from '../models/FullUser.js';
import store from '../state/store.js';
import { Server } from '@surtom/interfaces';

type DatabaseMessageType = 'score' | 'enhanced' | 'message';

export type DatabaseMessage = {
  ID?: number;
  Pseudo: string;
  Moderator: number;
  Texte?: string;
  Date: string;
  ImageData?: string;
  Reply?: number;
  Answer?: string;
  Mots?: string;
  Type?: DatabaseMessageType;
};

export function mapFullUserToUser(user: FullUser): Server.User {
  return {
    name: user.privateUser.name,
    moderatorLevel: user.privateUser.moderatorLevel,
    isMobile: user.privateUser.isMobile,
    isLoggedIn: user.privateUser.isLoggedIn,
    xp: user.privateUser.xp,
  };
}

export function mapDatabaseUserToMemoryUser(user: { Pseudo: string } | null): FullUser | null {
  if (!user) return null;
  return Object.values(store.getState().users).find((u) => u.privateUser.name === user.Pseudo) ?? null;
}

export function mapUserMessageToMemoryMessage(message: DatabaseMessage): Server.ChatMessage.Content.TextMessageContent {
  return {
    id: message.ID?.toString() ?? '',
    user: {
      name: message.Pseudo ?? '',
      moderatorLevel: message.Moderator ?? 0,
    },
    text: message.Texte ?? '',
    timestamp: message.Date ?? '',
    imageData: typeof message.ImageData === 'string' ? message.ImageData : undefined,
    replyId: message.Reply !== undefined ? message.Reply.toString() : undefined,
    deleted: 0,
  };
}

export function mapScoreMessageToMemoryMessage(message: DatabaseMessage): Server.ChatMessage.Content.ScoreMessageContent {
  return {
    id: message.ID?.toString() ?? '',
    user: {
      name: message.Pseudo ?? '',
      moderatorLevel: message.Moderator ?? 0,
    },
    answer: message.Answer ?? '',
    attempts: message.Mots ? JSON.parse(message.Mots) : [],
    timestamp: message.Date ?? '',
    deleted: 0,
  };
}

export function mapDatabaseTypeToMemoryType(type: DatabaseMessageType | undefined): Server.MessageType | undefined {
  if (!type) return undefined;
  switch (type) {
    case 'score':
      return Server.MessageType.SCORE;
    case 'enhanced':
      return Server.MessageType.ENHANCED;
    case 'message':
      return Server.MessageType.TEXT;
    default:
      return undefined;
  }
}

export function mapDatabaseMessageToMemoryMessage(
  message: DatabaseMessage,
): Server.ChatMessage.Content.TextMessageContent | Server.ChatMessage.Content.ScoreMessageContent | undefined {
  if (!message.Type) return undefined;
  switch (mapDatabaseTypeToMemoryType(message.Type)) {
    case Server.MessageType.ENHANCED:
    case Server.MessageType.TEXT:
      return mapUserMessageToMemoryMessage(message);
    case Server.MessageType.SCORE:
      return mapScoreMessageToMemoryMessage(message);
    default:
      return undefined;
  }
}
