export namespace Client {
  export enum MessageType {
    DELETE_MESSAGE = "deleteMessage",
    IS_TYPING = "isTyping",
    PING = "ping",
    CHAT_MESSAGE = "chatMessage",
    SCORE_TO_CHAT = "scoreToChat",
    TRY = "try",
  }

  export type Message =
    | { type: MessageType.DELETE_MESSAGE; content: number }
    | { type: MessageType.IS_TYPING }
    | { type: MessageType.PING }
    | { type: MessageType.CHAT_MESSAGE; content: TextChatMessageContent }
    | { type: MessageType.SCORE_TO_CHAT; content: ScoreContent }
    | { type: MessageType.TRY; content: string };

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
    ATTEMPT = "attempt",
  }

  export enum SavedMessageType {
    MAIL_ALL = "mailAll",
    PRIVATE_MESSAGE = "privateMessage",
    ENHANCED_MESSAGE = "enhancedMessage",
    SCORE = "score",
  }

  export type Message =
    | { type: MessageType.DELETE_MESSAGE; content: number }
    | { type: MessageType.GET_MESSAGES; content: ChatMessage.SavedType[] }
    | { type: MessageType.IS_TYPING; content: string }
    | { type: MessageType.LAST_TIME_MESSAGE; content: string }
    | { type: MessageType.LOG; content: string }
    | {
        type: MessageType.MESSAGE;
        content: ChatMessage.Text | ChatMessage.Score | ChatMessage.Status;
      }
    | { type: MessageType.STATS; content: Record<`${number}`, number> }
    | { type: MessageType.LOGIN; content: LoginMessage }
    | { type: MessageType.USER_LIST; content: User[] }
    | { type: MessageType.EVAL; content: string }
    | {
        type: MessageType.DAILY_WORDS;
        content: { words: string[]; attempts: string[] };
      }
    | { type: MessageType.ATTEMPT; content: string };

  export namespace ChatMessage {
    export type Type = Text | Score | Status;
    export type SavedType = Text | Score;

    export type Text =
      | { type: MessageType.MAIL_ALL; content: Content.TextMessageContent }
      | {
          type: MessageType.PRIVATE_MESSAGE;
          content: Content.TextMessageContent;
        }
      | {
          type: MessageType.ENHANCED_MESSAGE;
          content: Content.TextMessageContent;
        };

    export type Score = {
      type: MessageType.SCORE;
      content: Content.ScoreMessageContent;
    };

    export type Status =
      | {
          type: MessageType.SUCCESS;
          content: Pick<Content.TextMessageContent, "text"> &
            Pick<Content.BaseMessageContent, "timestamp">;
        }
      | {
          type: MessageType.ERROR;
          content: Pick<Content.TextMessageContent, "text"> &
            Pick<Content.BaseMessageContent, "timestamp">;
        };

    export namespace Content {
      export interface BaseMessageContent {
        id: string;
        user: Pick<Server.User, "name" | "moderatorLevel">;
        timestamp: string;
        deleted: number;
      }

      export interface TextMessageContent extends BaseMessageContent {
        text: string;
        imageData?: string;
        replyId?: string;
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
