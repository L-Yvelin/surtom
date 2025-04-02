export enum MessageType {
  MESSAGE = "message",
  SCORE = "score",
  USER = "user",
  LOGIN = "login",
  STATS = "stats",
  USER_LIST = "usersList",
  GET_MESSAGES = "getMessages",
  SET_USERNAME = "setUsername",
  LAST_TIME_MESSAGE = "lastTimeMessage",
  DELETE_MESSAGE = "deleteMessage",
  IS_TYPING = "isTyping",
  PING = "ping",
  LOG = "log",
  SUCCESS = "success",
  ERROR = "error",
  PRIVATE_MESSAGE = "privateMessage",
  // SavedMessageType
  MAIL_ALL = "mailAll",
  SCORE_TO_CHAT = "scoreToChat",
  ENHANCED_MESSAGE = "enhancedMessage",
}

export enum SavedMessageType {
  SCORE = "score",
  MAIL_ALL = "mailAll",
  ENHANCED_MESSAGE = "enhancedMessage",
}

export type Message =
  | {
      type: MessageType.STATS;
      content: Record<`${number}`, number>;
    }
  | {
      type: MessageType.USER_LIST;
      content: User[];
    }
  | {
      type: MessageType.MESSAGE;
      content: ChatMessage;
    }
  | {
      type: MessageType.SCORE;
      content: ScoreContent;
    }
  | {
      type: MessageType.USER;
      content: PrivateUser;
    }
  | {
      type: MessageType.GET_MESSAGES;
      content: ChatMessage[];
    }
  | {
      type: MessageType.SET_USERNAME;
      content: string;
    }
  | {
      type: MessageType.LAST_TIME_MESSAGE;
      content: string;
    }
  | {
      type: MessageType.DELETE_MESSAGE;
      content: number;
    }
  | {
      type: MessageType.IS_TYPING;
      content: string;
    }
  | {
      type: MessageType.PING;
    }
  | {
      type: MessageType.LOGIN;
      content: string;
    }
  | {
      type: MessageType.LOG;
      content: string;
    };

export interface User {
  name: string;
  isModerator: number;
  isMobile: boolean;
  isLoggedIn: boolean;
}

export interface PrivateUser {
  name: string;
  isModerator: number;
  isLoggedIn: boolean;
  isMobile: boolean;
  sentTheScore: boolean;
  words: string[];
  isBanned: boolean;
}

export type ChatMessage =
  | {
      type: MessageType.MAIL_ALL;
      content: UserMessageContent;
    }
  | {
      type: MessageType.SCORE_TO_CHAT;
      content: ScoreContent;
    }
  | {
      type: MessageType.PRIVATE_MESSAGE;
      content: UserMessageContent;
    }
  | {
      type: MessageType.SUCCESS;
      content: Pick<UserMessageContent, "text" | "timestamp">;
    }
  | {
      type: MessageType.ERROR;
      content: Pick<UserMessageContent, "text" | "timestamp">;
    }
  | {
      type: MessageType.ENHANCED_MESSAGE;
      content: UserMessageContent;
    };

export interface UserMessageContent {
  id: string;
  text: string;
  user: string;
  timestamp: string;
  isModerator: number;
  imageData?: any;
  answer?: string | null;
}

export interface ScoreContent {
  id: string;
  solution: string;
  attempts: string[];
}

export type ChatMessageContent = UserMessageContent | ScoreContent;
