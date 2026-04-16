import bcrypt from 'bcrypt';
import crypto from 'crypto';
import WS from 'ws';
import Constants from './constants.js';
import FullUser from '../models/User.js';
import store from '../store.js';
import { Server, Client, validateServerMessage } from '@surtom/interfaces';

type DatabaseMessageType = 'score' | 'enhanced' | 'message';
type DatabaseMessage = {
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

export function passwordInHashArray(password: string, hashArray: string[]): boolean {
  return hashArray.some((hash) => bcrypt.compareSync(password, hash));
}

export function generateRandomHash(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function getRandomFunnyName(): string {
  return Constants.funnyNames[Math.floor(Math.random() * Constants.funnyNames.length)];
}

export function validateUsername(username: string): boolean {
  const usernamePattern = /^[-_a-zA-Z0-9]{1,16}$/;
  return usernamePattern.test(username);
}

export function validateText(text: string): boolean {
  const textPattern = /^.{1,256}$/;
  return textPattern.test(text);
}

export function getUserRank(user: FullUser): string | null {
  return user.privateUser.moderatorLevel ? 'moderator' : user.privateUser.isLoggedIn ? 'loggedIn' : null;
}

export function sendToUser(connection: WS, message: Server.Message): void {
  if (!validateServerMessage(message)) {
    console.error('Attempted to send invalid message:', JSON.stringify(message));
    return;
  }
  if (connection.readyState === WS.OPEN) {
    connection.send(JSON.stringify(message));
  }
}

export function sendToAll(clients: Set<WS>, message: Server.Message): void {
  if (!validateServerMessage(message)) {
    console.error('Attempted to broadcast invalid message:', JSON.stringify(message));
    return;
  }
  const payload = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WS.OPEN) {
      client.send(payload);
    }
  });
}

export function sendError(connection: WS, text: string): void {
  sendToUser(connection, {
    type: Server.MessageType.MESSAGE,
    content: {
      type: Server.MessageType.ERROR,
      content: { text, timestamp: new Date().toISOString() },
    },
  });
}

export function sendSuccess(connection: WS, text: string): void {
  sendToUser(connection, {
    type: Server.MessageType.MESSAGE,
    content: {
      type: Server.MessageType.SUCCESS,
      content: { text, timestamp: new Date().toISOString() },
    },
  });
}

export function handleIsBanned(user: FullUser): void {
  sendToUser(user.connection, {
    type: Server.MessageType.EVAL,
    content: `delete SocketClient.ws;clearInterval(SocketClient.pingInterval);setTimeout(() => {window.banned = true;document.body.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:darkred;font-size:2em;">You have been banned</div>';},1000);`,
  });
  user.connection.close();
}

export function mapDatabaseUserToMemoryUser(user: any | null): FullUser | null {
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

export function isScoreContentCoherent(content: Client.ScoreContent): boolean {
  return (
    content.attempts.length > 0 &&
    content.attempts.length <= 6 &&
    content.attempts.every((attempt) => attempt.length === content.attempts[0].length)
  );
}
