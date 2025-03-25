export enum MessageType {
  MESSAGE = "message",
  SCORE = "score",
  USER = "user",
  STATS = "stats",
  USER_LIST = "usersList",
  GET_MESSAGES = "getMessages",
  SET_USERNAME = "setUsername",
  LAST_TIME_MESSAGE = "lastTimeMessage",
  MAIL_ALL = "mailAll",
  SCORE_TO_CHAT = "scoreToChat",
  DELETE_MESSAGE = "deleteMessage",
  IS_TYPING = "isTyping",
  PING = "ping",
  PRIVATE_MESSAGE = "privateMessage",
  SUCCESS = "success",
  ERROR = "error",
  ENHANCED_MESSAGE = "enhancedMessage",
  LOG = "log",
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
      content: string;
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
      type: MessageType.LOG;
      content: string;
    };

interface ScoreContent {
  string: string;
}

export interface User {
  name: string;
  isModerator: number;
  isMobile: boolean;
}

export type ChatMessage =
  | {
      type: MessageType.MAIL_ALL;
      content: ChatMessageContent;
    }
  | {
      type: MessageType.SCORE_TO_CHAT;
      content: {
        tab_couleurs: string[];
        liste_mots: string[];
      };
    }
  | {
      type: MessageType.PRIVATE_MESSAGE;
      content: ChatMessageContent;
    }
  | {
      type: MessageType.SUCCESS;
      content: Pick<ChatMessageContent, "text" | "timestamp">;
    }
  | {
      type: MessageType.ERROR;
      content: Pick<ChatMessageContent, "text" | "timestamp">;
    }
  | {
      type: MessageType.ENHANCED_MESSAGE;
      content: ChatMessageContent;
    };

interface ChatMessageContent {
  id?: string;
  text: string;
  user: string;
  timestamp: string;
  isModerator: number;
  imageData?: any;
  answer?: string | null;
}
