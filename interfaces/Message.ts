export namespace Client {
  export enum MessageType {
    DELETE_MESSAGE = 'deleteMessage',
    IS_TYPING = 'isTyping',
    PING = 'ping',
    CHAT_MESSAGE = 'chatMessage',
    SCORE_TO_CHAT = 'scoreToChat',
    TRY = 'try',
    CURSOR_POSITION = 'cursorPosition',
    JOIN_WORLD = 'joinWorld',
    LEAVE_WORLD = 'leaveWorld',
    LIST_WORLDS = 'listWorlds',
    MARK_CHAT_READ = 'markChatRead',
  }

  export type Message =
    | { type: MessageType.DELETE_MESSAGE; content: number }
    | { type: MessageType.IS_TYPING }
    | { type: MessageType.PING }
    | { type: MessageType.CHAT_MESSAGE; content: TextChatMessageContent }
    | { type: MessageType.SCORE_TO_CHAT; content: ScoreContent }
    | { type: MessageType.TRY; content: string }
    | { type: MessageType.CURSOR_POSITION; content: { cursor: CursorPosition } }
    | { type: MessageType.JOIN_WORLD; content: { worldId: string } }
    | { type: MessageType.LEAVE_WORLD }
    | { type: MessageType.LIST_WORLDS }
    | { type: MessageType.MARK_CHAT_READ };

  export type ChatMessage =
    | { type: MessageType.CHAT_MESSAGE; content: TextChatMessageContent }
    | { type: MessageType.SCORE_TO_CHAT; content: ScoreContent };

  export interface TextChatMessageContent {
    text: string;
    imageData?: string;
    replyId?: string;
  }

  export interface ScoreContent {
    custom?: string;
    attempts: string[][];
  }
}

export namespace Server {
  export enum MessageType {
    MESSAGE = 'message',
    SCORE = 'score',
    LOGIN = 'login',
    STATS = 'stats',
    USER_LIST = 'usersList',
    GET_MESSAGES = 'getMessages',
    LAST_TIME_MESSAGE = 'lastTimeMessage',
    CHAT_LAST_READ = 'chatLastRead',
    DELETE_MESSAGE = 'deleteMessage',
    IS_TYPING = 'isTyping',
    PONG = 'pong',
    LOG = 'log',
    SUCCESS = 'success',
    ERROR = 'error',
    PRIVATE_MESSAGE = 'privateMessage',
    TEXT = 'text',
    ENHANCED = 'enhanced',
    DAILY_WORDS = 'dailyWords',
    ATTEMPT = 'attempt',
    XP = 'xp',
    CURSOR_POSITION = 'cursorPosition',
    WORLD_LIST = 'worldList',
    GAME_FINISHED = 'gameFinished',
    HELP = 'help',
  }

  export interface WorldSummary {
    id: string;
    displayName: string;
    language: string;
    persistent: boolean;
    memberCount: number;
  }

  export enum SavedMessageType {
    TEXT = 'text',
    PRIVATE_MESSAGE = 'privateMessage',
    ENHANCED = 'enhanced',
    SCORE = 'score',
  }

  export type Message =
    | { type: MessageType.DELETE_MESSAGE; content: { id: number; deleted: number } }
    | { type: MessageType.GET_MESSAGES; content: ChatMessage.Type[] }
    | { type: MessageType.IS_TYPING; content: string }
    | { type: MessageType.LAST_TIME_MESSAGE; content: string }
    | { type: MessageType.CHAT_LAST_READ; content: string | null }
    | { type: MessageType.LOG; content: string }
    | {
        type: MessageType.MESSAGE;
        content: ChatMessage.Text | ChatMessage.Score | ChatMessage.Status | ChatMessage.GameFinished;
      }
    | { type: MessageType.STATS; content: Record<`${number}`, number> }
    | { type: MessageType.LOGIN; content: LoginMessage }
    | { type: MessageType.USER_LIST; content: User[] }
    | {
        type: MessageType.DAILY_WORDS;
        content: { words: string[]; attempts: string[] };
      }
    | { type: MessageType.ATTEMPT; content: string }
    | { type: MessageType.XP; content: number }
    | { type: MessageType.CURSOR_POSITION; content: CursorPositionMessage }
    | { type: MessageType.WORLD_LIST; content: WorldSummary[] };

  export namespace ChatMessage {
    export type Type = Text | Score | Status | GameFinished | Help;
    export type SavedType = Text | Score;

    export type Text =
      | { type: MessageType.TEXT; content: Content.TextMessageContent }
      | {
          type: MessageType.PRIVATE_MESSAGE;
          content: Content.TextMessageContent;
        }
      | {
          type: MessageType.ENHANCED;
          content: Content.EnhancedTextMessageContent;
        };

    export type Score = {
      type: MessageType.SCORE;
      content: Content.ScoreMessageContent;
    };

    export type Status =
      | {
          type: MessageType.SUCCESS;
          content: Pick<Content.TextMessageContent, 'text'> & Pick<Content.BaseMessageContent, 'timestamp'>;
        }
      | {
          type: MessageType.ERROR;
          content: Pick<Content.TextMessageContent, 'text'> & Pick<Content.BaseMessageContent, 'timestamp'>;
        };

    export type GameFinished = {
      type: MessageType.GAME_FINISHED;
      content: { win: boolean; attempts: string[][]; hasSharedScore: boolean; timestamp: string };
    };

    export type Help = {
      type: MessageType.HELP;
      content: { timestamp: string };
    };

    export namespace Content {
      export interface BaseMessageContent {
        id: string;
        user: Pick<Server.User, 'name' | 'moderatorLevel'>;
        timestamp: string;
        deleted: number;
      }

      export interface TextMessageContent extends BaseMessageContent {
        text: string;
        imageData?: string;
        replyId?: string;
      }

      export interface EnhancedTextMessageContent extends TextMessageContent {
        color?: string;
      }

      export interface ScoreMessageContent extends BaseMessageContent {
        answer: string;
        attempts: string[][];
      }
    }
  }

  export interface User {
    name: string;
    moderatorLevel: number;
    xp: number;
    isMobile: boolean;
    isLoggedIn: boolean;
  }

  export interface PrivateUser extends User {
    words: string[];
    isBanned: boolean;
  }

  export interface LoginMessage {
    user: PrivateUser;
    sessionHash?: string;
  }

  export interface CursorPositionMessage {
    user: User;
    cursor: CursorPosition;
  }
}

export interface CursorPosition {
  x: number;
  y: number;
}

export enum LetterState {
  Miss,
  Misplaced,
  Correct,
}

export interface Letter {
  letter: string;
  state?: LetterState;
}

export type Word = Letter[];

export type Tries = Word[];

export const MAX_TRIES_PER_GAME = 6;

export const MAX_IMAGE_BYTES = 110 * 1024;
