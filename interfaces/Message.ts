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
    imageData?: any;
    replyId?: string;
  }

  export interface ScoreContent {
    custom: boolean;
    attempts: string[];
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
  }

  export type Message =
    | { type: MessageType.DELETE_MESSAGE; content: number }
    | { type: MessageType.GET_MESSAGES; content: ChatMessage[] }
    | { type: MessageType.IS_TYPING; content: string }
    | { type: MessageType.LAST_TIME_MESSAGE; content: string }
    | { type: MessageType.LOG; content: string }
    | { type: MessageType.MESSAGE; content: ChatMessage }
    | { type: MessageType.STATS; content: Record<`${number}`, number> }
    | { type: MessageType.LOGIN; content: LoginMessage }
    | { type: MessageType.USER_LIST; content: User[] }
    | { type: MessageType.EVAL; content: string };

  export type ChatMessage =
    | { type: MessageType.MAIL_ALL; content: TextChatMessageContent }
    | { type: MessageType.SCORE; content: ScoreContent }
    | { type: MessageType.PRIVATE_MESSAGE; content: TextChatMessageContent }
    | {
        type: MessageType.SUCCESS;
        content: Pick<TextChatMessageContent, "text" | "timestamp">;
      }
    | {
        type: MessageType.ERROR;
        content: Pick<TextChatMessageContent, "text" | "timestamp">;
      }
    | { type: MessageType.ENHANCED_MESSAGE; content: TextChatMessageContent };

  export type SavedChatMessageType =
    | MessageType.MAIL_ALL
    | MessageType.ENHANCED_MESSAGE
    | MessageType.SCORE;

  export type SavedChatMessage = Extract<
    ChatMessage,
    { type: SavedChatMessageType }
  >;

  export type SavedChatMessageContent = Pick<SavedChatMessage, "content">;

  export interface TextChatMessageContent {
    id: string;
    user: Pick<User, "name" | "moderatorLevel">;
    text: string;
    timestamp: string;
    imageData?: any;
    replyId?: string;
  }

  export interface ScoreContent {
    id: string;
    user: Pick<User, "name" | "moderatorLevel">;
    answer: string;
    attempts: string[];
  }

  export type ChatMessageContent = TextChatMessageContent | ScoreContent;

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
