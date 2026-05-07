import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from './pool.js';
import { Client, Server } from '@surtom/interfaces';
import { MessageAttributes } from '../dbModels/init-models.js';
import { getPlayerByName } from './playerRepository.js';
import { getTodaysWord } from './wordRepository.js';

type MessageJoinRow = {
  ID: number;
  Username: string;
  Timestamp: string | Date;
  Type: string;
  Text: string | null;
  ImageData?: string | null;
  ReplyID?: number | null;
  Answer?: string | null;
  Attempts?: string | null;
  IsCustom?: number | null;
  IsAdmin?: number;
  Deleted?: number | null;
};

const MESSAGE_JOIN_SELECT = `
  m.ID,
  p.Username,
  m.Timestamp,
  m.Type,
  tc.Text,
  tc.ImageData,
  tc.ReplyID,
  sc.Answer,
  sc.Attempts,
  sc.IsCustom,
  p.IsAdmin,
  m.Deleted
`;

const MESSAGE_JOIN_FROM = `
  FROM Message m
  JOIN Player p ON m.PlayerID = p.ID
  LEFT JOIN TextContent tc ON m.ID = tc.ID
  LEFT JOIN ScoreContent sc ON m.ID = sc.ID
`;

function mapMessage(row: MessageJoinRow): Server.ChatMessage.SavedType {
  const baseContent: Server.ChatMessage.Content.BaseMessageContent = {
    id: row.ID.toString(),
    user: {
      name: row.Username,
      moderatorLevel: row.IsAdmin ?? 0,
    },
    timestamp: new Date(row.Timestamp).toISOString(),
    deleted: row.Deleted ?? 0,
  };
  if (row.Type === 'SCORE') {
    return {
      type: Server.MessageType.SCORE,
      content: {
        ...baseContent,
        answer: row.Answer ?? '',
        attempts: row.Attempts ? JSON.parse(row.Attempts) : [],
      },
    } as Server.ChatMessage.SavedType;
  }

  const messageType =
    row.Type === 'ENHANCED'
      ? Server.MessageType.ENHANCED
      : row.Type === 'TEXT'
        ? Server.MessageType.TEXT
        : Server.MessageType.PRIVATE_MESSAGE;
  return {
    type: messageType,
    content: {
      ...baseContent,
      text: row.Text ?? '',
      imageData: row.ImageData || undefined,
      replyId: row.ReplyID ? row.ReplyID.toString() : undefined,
    },
  };
}

function mapClientMessageType(clientType: Client.MessageType): string {
  switch (clientType) {
    case Client.MessageType.SCORE_TO_CHAT:
      return 'SCORE';
    case Client.MessageType.CHAT_MESSAGE:
    default:
      return 'TEXT';
  }
}

export function getHelpMessage(): Server.ChatMessage.SavedType {
  return {
    type: Server.MessageType.ENHANCED,
    content: {
      id: '0',
      user: { name: 'System', moderatorLevel: 2 },
      text: JSON.stringify([
        { text: 'Faites ', color: 'LemonChiffon' },
        { text: '/help', color: 'DarkKhaki' },
        { text: " pour plus d'information", color: 'LemonChiffon' },
      ]),
      timestamp: new Date().toISOString(),
      deleted: 0,
    },
  };
}

export async function getMessages(includeDeleted = false, max = 200, showHelp = false): Promise<Server.ChatMessage.SavedType[]> {
  const whereClause = includeDeleted ? '' : 'WHERE m.Deleted IS NULL OR m.Deleted = 0';
  const query = `
    SELECT ${MESSAGE_JOIN_SELECT}
    ${MESSAGE_JOIN_FROM}
    ${whereClause}
    ORDER BY m.Timestamp DESC
    LIMIT ?;
  `;
  const [results] = await pool.query<(MessageJoinRow & RowDataPacket)[]>(query, [max]);
  const messages = results.length ? results.map((row) => mapMessage(row)) : [];
  if (showHelp) {
    messages.unshift(getHelpMessage());
  }
  return messages.reverse();
}

export async function getMessageById(id: number): Promise<Server.ChatMessage.SavedType | undefined> {
  const [results] = await pool.query<(MessageJoinRow & RowDataPacket)[]>(
    `SELECT ${MESSAGE_JOIN_SELECT} ${MESSAGE_JOIN_FROM} WHERE m.ID = ?`,
    [id],
  );
  return results.length ? mapMessage(results[0]) : undefined;
}

export async function getLastMessageTimestamp(): Promise<string | null> {
  const [results] = await pool.query<(Pick<MessageAttributes, 'Timestamp'> & RowDataPacket)[]>(
    'SELECT Timestamp FROM Message ORDER BY Timestamp DESC LIMIT 1',
  );
  return results.length ? (results[0].Timestamp as unknown as string) : null;
}

export async function saveMessage(user: Server.PrivateUser, message: Client.ChatMessage): Promise<Server.Message> {
  const player = await getPlayerByName(user.name);
  if (!player) throw new Error('Player not found');

  const timestamp = new Date();
  const [messageResult] = await pool.query<ResultSetHeader>('INSERT INTO Message (PlayerID, Timestamp, Type) VALUES (?, ?, ?)', [
    player.id,
    timestamp,
    mapClientMessageType(message.type),
  ]);

  const messageId = messageResult.insertId;

  switch (message.type) {
    case Client.MessageType.SCORE_TO_CHAT: {
      const { custom, attempts } = message.content;
      const answer = message.content.custom ? message.content.custom : await getTodaysWord();
      await pool.query('INSERT INTO ScoreContent (ID, Answer, Attempts, IsCustom) VALUES (?, ?, ?, ?)', [
        messageId,
        answer,
        JSON.stringify(attempts),
        !!custom,
      ]);

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
      const { text, imageData, replyId } = message.content;
      await pool.query('INSERT INTO TextContent (ID, Text, ImageData, ReplyID) VALUES (?, ?, ?, ?)', [
        messageId,
        text,
        imageData || null,
        replyId ? parseInt(replyId) : null,
      ]);

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

export async function toggleMessage(messageId: number, user: Server.PrivateUser): Promise<boolean> {
  const message = await getMessageById(messageId);
  if (!message) return false;

  if (user.moderatorLevel < message.content.deleted && message.content.user.name === user.name) return false;

  const newDeletedStatus = message.content.deleted ? 0 : user.moderatorLevel;

  const [result] = await pool.query<ResultSetHeader>('UPDATE Message SET Deleted = ? WHERE ID = ?', [newDeletedStatus, messageId]);
  return result.affectedRows > 0;
}
