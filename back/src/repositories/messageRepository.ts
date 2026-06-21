import { and, desc, eq, isNull, or, sql } from 'drizzle-orm';
import { Client, Server } from '@surtom/interfaces';
import { db } from '../db/client.js';
import { message, player, scoreContent, textContent, wordHistory } from '../db/schema.js';
import { getPlayerByName } from './playerRepository.js';
import { getTodaysWord } from './wordRepository.js';
import { canToggleDeletion } from '../utils/messagePermissions.js';

interface MessageJoinRow {
  id: number;
  username: string;
  timestamp: Date;
  type: 'TEXT' | 'ENHANCED' | 'SCORE';
  text: string | null;
  imageData: string | null;
  replyId: number | null;
  answer: string | null;
  attempts: string | null;
  isCustom: number | null;
  isAdmin: number;
  deleted: number | null;
}

const MESSAGE_JOIN_FIELDS = {
  id: message.id,
  username: player.username,
  timestamp: message.timestamp,
  type: message.type,
  text: textContent.text,
  imageData: textContent.imageData,
  replyId: textContent.replyId,
  answer: scoreContent.answer,
  attempts: scoreContent.attempts,
  isCustom: scoreContent.isCustom,
  isAdmin: player.isAdmin,
  deleted: message.deleted,
};

function mapMessage(row: MessageJoinRow): Server.ChatMessage.SavedType {
  const baseContent: Server.ChatMessage.Content.BaseMessageContent = {
    id: row.id.toString(),
    user: {
      name: row.username,
      moderatorLevel: row.isAdmin ?? 0,
    },
    timestamp: new Date(row.timestamp).toISOString(),
    deleted: row.deleted ?? 0,
  };
  if (row.type === 'SCORE') {
    return {
      type: Server.MessageType.SCORE,
      content: {
        ...baseContent,
        answer: row.answer ?? '',
        attempts: row.attempts ? JSON.parse(row.attempts) : [],
      },
    } as Server.ChatMessage.SavedType;
  }

  const messageType =
    row.type === 'ENHANCED'
      ? Server.MessageType.ENHANCED
      : row.type === 'TEXT'
        ? Server.MessageType.TEXT
        : Server.MessageType.PRIVATE_MESSAGE;
  return {
    type: messageType,
    content: {
      ...baseContent,
      text: row.text ?? '',
      imageData: row.imageData || undefined,
      replyId: row.replyId ? row.replyId.toString() : undefined,
    },
  };
}

function mapClientMessageType(clientType: Client.MessageType): 'TEXT' | 'SCORE' {
  switch (clientType) {
    case Client.MessageType.SCORE_TO_CHAT:
      return 'SCORE';
    case Client.MessageType.CHAT_MESSAGE:
    default:
      return 'TEXT';
  }
}

export function getHelpMessage(): Server.ChatMessage.Help {
  return {
    type: Server.MessageType.HELP,
    content: { timestamp: new Date().toISOString() },
  };
}

export async function getMessages(worldId = 'fr', includeDeleted = false, max = 200, showHelp = false): Promise<Server.ChatMessage.Type[]> {
  const baseWhere = eq(message.worldId, worldId);
  const where = includeDeleted ? baseWhere : and(baseWhere, or(isNull(message.deleted), eq(message.deleted, 0)));

  const rows = await db
    .select(MESSAGE_JOIN_FIELDS)
    .from(message)
    .innerJoin(player, eq(message.playerId, player.id))
    .leftJoin(textContent, eq(message.id, textContent.id))
    .leftJoin(scoreContent, eq(message.id, scoreContent.id))
    .where(where)
    .orderBy(desc(message.timestamp))
    .limit(max);

  const messages: Server.ChatMessage.Type[] = rows.map((row) => mapMessage(row as MessageJoinRow));
  if (showHelp) {
    messages.unshift(getHelpMessage());
  }
  return messages.reverse();
}

export async function getMessageById(id: number): Promise<Server.ChatMessage.SavedType | undefined> {
  const rows = await db
    .select(MESSAGE_JOIN_FIELDS)
    .from(message)
    .innerJoin(player, eq(message.playerId, player.id))
    .leftJoin(textContent, eq(message.id, textContent.id))
    .leftJoin(scoreContent, eq(message.id, scoreContent.id))
    .where(eq(message.id, id))
    .limit(1);
  return rows.length ? mapMessage(rows[0] as MessageJoinRow) : undefined;
}

export async function getLastMessageTimestamp(): Promise<string | null> {
  const rows = await db.select({ timestamp: message.timestamp }).from(message).orderBy(desc(message.timestamp)).limit(1);
  return rows.length ? rows[0].timestamp.toISOString() : null;
}

export async function saveMessage(user: Server.PrivateUser, msg: Client.ChatMessage, worldId = 'fr'): Promise<Server.Message> {
  const found = await getPlayerByName(user.name);
  if (!found) throw new Error('Player not found');

  const timestamp = new Date();
  const insertResult = await db.insert(message).values({
    playerId: found.id,
    worldId,
    timestamp,
    type: mapClientMessageType(msg.type),
  });
  const messageId = (insertResult as unknown as [{ insertId: number }, unknown])[0].insertId;

  switch (msg.type) {
    case Client.MessageType.SCORE_TO_CHAT: {
      const { custom, attempts } = msg.content;
      const answer = msg.content.custom ? msg.content.custom : await getTodaysWord(worldId);
      const wordHistoryRows = await db
        .select({ id: wordHistory.id })
        .from(wordHistory)
        .where(and(eq(wordHistory.worldId, worldId), sql`DATE(${wordHistory.assignedDate}) = CURDATE()`))
        .orderBy(desc(wordHistory.assignedDate))
        .limit(1);
      const wordHistoryId = wordHistoryRows.length ? wordHistoryRows[0].id : 0;
      await db.insert(scoreContent).values({
        id: messageId,
        wordHistoryId,
        answer: answer ?? '',
        attempts: JSON.stringify(attempts),
        isCustom: custom ? 1 : 0,
      });

      return {
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.SCORE,
          content: {
            id: messageId.toString(),
            answer: answer ?? '',
            attempts,
            timestamp: timestamp.toISOString(),
            user: {
              name: user.name,
              moderatorLevel: user.moderatorLevel,
            },
            deleted: 0,
          },
        },
      };
    }
    case Client.MessageType.CHAT_MESSAGE: {
      const { text, imageData, replyId } = msg.content;
      await db.insert(textContent).values({
        id: messageId,
        text,
        imageData: imageData || null,
        replyId: replyId ? parseInt(replyId) : null,
      });

      return {
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.TEXT,
          content: {
            id: messageId.toString(),
            text,
            timestamp: timestamp.toISOString(),
            user: {
              name: user.name,
              moderatorLevel: user.moderatorLevel,
            },
            imageData,
            replyId,
            deleted: 0,
          },
        },
      };
    }
    default:
      throw new Error('Unsupported message type');
  }
}

export async function toggleMessage(messageId: number, user: Server.PrivateUser): Promise<number | null> {
  const existing = await getMessageById(messageId);
  if (!existing) return null;

  if (!canToggleDeletion(user, existing.content.user, existing.content.deleted)) return null;

  const newDeletedStatus = existing.content.deleted ? 0 : user.moderatorLevel || 1;

  const updateResult = await db.update(message).set({ deleted: newDeletedStatus }).where(eq(message.id, messageId));
  const affected = (updateResult as unknown as [{ affectedRows: number }, unknown])[0].affectedRows;
  return affected > 0 ? newDeletedStatus : null;
}
