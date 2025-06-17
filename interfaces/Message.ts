export namespace Client {
  export enum MessageType {
    DELETE_MESSAGE = "deleteMessage",
    IS_TYPING = "isTyping",
    PING = "ping",
    CHAT_MESSAGE = "chatMessage",
    SCORE_TO_CHAT = "scoreToChat",
  }

  export type Message =
    | { type: MessageType.DELETE_MESSAGE; content: number }
    | { type: MessageType.IS_TYPING }
    | { type: MessageType.PING }
    | { type: MessageType.CHAT_MESSAGE; content: TextChatMessageContent }
    | { type: MessageType.SCORE_TO_CHAT; content: ScoreContent };

  export type ChatMessage =
    | { type: MessageType.CHAT_MESSAGE; content: TextChatMessageContent }
    | { type: MessageType.SCORE_TO_CHAT; content: ScoreContent };

  export interface TextChatMessageContent {
    text: string;
    imageData?: string;
    replyId?: string;
  }

  export interface ScoreContent {
    custom: boolean;
    attempts: string[][];
  }
}

export namespace Server {
  export enum MessageType {
    MESSAGE = "message",
    SCORE = "score",
    LOGIN = "login",
    STATS = "stats",
    USER_LIST = "usersList",
    GET_MESSAGES = "getMessages",
    LAST_TIME_MESSAGE = "lastTimeMessage",
    DELETE_MESSAGE = "deleteMessage",
    IS_TYPING = "isTyping",
    PONG = "pong",
    LOG = "log",
    SUCCESS = "success",
    ERROR = "error",
    PRIVATE_MESSAGE = "privateMessage",
    MAIL_ALL = "mailAll",
    ENHANCED_MESSAGE = "enhancedMessage",
    EVAL = "eval",
    DAILY_WORDS = "dailyWords",
  }

  export enum SavedMessageType {
    MAIL_ALL = "mailAll",
    PRIVATE_MESSAGE = "privateMessage",
    ENHANCED_MESSAGE = "enhancedMessage",
    SCORE = "score",
  }

  export type Message =
    | { type: MessageType.DELETE_MESSAGE; content: number }
    | { type: MessageType.GET_MESSAGES; content: ChatMessage.User[] }
    | { type: MessageType.IS_TYPING; content: string }
    | { type: MessageType.LAST_TIME_MESSAGE; content: string }
    | { type: MessageType.LOG; content: string }
    | {
        type: MessageType.MESSAGE;
        content: ChatMessage.User | ChatMessage.Score | ChatMessage.Status;
      }
    | { type: MessageType.STATS; content: Record<`${number}`, number> }
    | { type: MessageType.LOGIN; content: LoginMessage }
    | { type: MessageType.USER_LIST; content: User[] }
    | { type: MessageType.EVAL; content: string }
    | { type: MessageType.SUCCESS; content: ChatMessage.Status }
    | { type: MessageType.ERROR; content: ChatMessage.Status }
    | { type: MessageType.DAILY_WORDS; content: string[] };

  export namespace ChatMessage {
    export type Type = User | Score | Status;
    export type SavedType = User | Score;

    export type User =
      | { type: MessageType.MAIL_ALL; content: Content.UserMessageContent }
      | {
          type: MessageType.PRIVATE_MESSAGE;
          content: Content.UserMessageContent;
        }
      | {
          type: MessageType.ENHANCED_MESSAGE;
          content: Content.UserMessageContent;
        };

    export type Score = {
      type: MessageType.SCORE;
      content: Content.ScoreMessageContent;
    };

    export type Status =
      | {
          type: MessageType.SUCCESS;
          content: Pick<Content.UserMessageContent, "text" | "timestamp">;
        }
      | {
          type: MessageType.ERROR;
          content: Pick<Content.UserMessageContent, "text" | "timestamp">;
        };

    export namespace Content {
      export interface UserMessageContent {
        id: string;
        user: Pick<Server.User, "name" | "moderatorLevel">;
        text: string;
        timestamp: string;
        imageData?: string;
        replyId?: string;
      }

      export interface ScoreMessageContent {
        id: string;
        user: Pick<Server.User, "name" | "moderatorLevel">;
        answer: string;
        attempts: string[][];
        timestamp: string;
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
    sentTheScore: boolean;
    words: string[];
    isBanned: boolean;
  }

  export interface LoginMessage {
    user: PrivateUser;
    sessionHash?: string;
  }
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
