import { create } from 'zustand';
import { Server } from '@surtom/interfaces';
import { defaultPlayer } from './usePlayerStore';
import { isSavedChatMessage } from '../features/Chat/utils/messageFormatting';
import i18n from '../i18n';

interface ChatStore {
  messages: Server.ChatMessage.Type[];
  setMessages: (messages: Server.ChatMessage.Type[]) => void;
  answeringTo: string | null;
  setAnsweringTo: (id: string | null) => void;
  removeMessage: (messageId: string) => void;
  setMessageDeleted: (messageId: string, deleted: number) => void;
  addMessage: (message: Server.ChatMessage.Type) => void;
  scrollToBottom: () => void;
  setScrollToBottom: (fn: () => void) => void;
  scrollToFirstUnread: () => void;
  setScrollToFirstUnread: (fn: () => void) => void;
  focusInput: (message?: string) => void;
  setFocusInput: (fn: () => void) => void;
  lastReadAt: string | null;
  setLastReadAt: (timestamp: string | null) => void;
  hasUnread: boolean;
  setHasUnread: (value: boolean) => void;
  resetSession: () => void;
  resetWorld: () => void;
}

const defaultMessage: Server.ChatMessage.SavedType = {
  type: Server.MessageType.TEXT,
  content: {
    id: '1',
    user: defaultPlayer,
    text: i18n.t('common.loading'),
    timestamp: new Date().toISOString(),
    deleted: 0,
  },
};

const initialSession = {
  answeringTo: null as string | null,
};

const initialWorld = {
  messages: [defaultMessage] as Server.ChatMessage.Type[],
  ...initialSession,
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialWorld,
  lastReadAt: null,
  hasUnread: false,
  setMessages: (messages) => set({ messages }),
  setAnsweringTo: (id) => set({ answeringTo: id }),
  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages?.filter((m) => !isSavedChatMessage(m) || m.content.id !== messageId) || [],
    })),
  setMessageDeleted: (messageId, deleted) =>
    set((state) => ({
      messages: (state.messages || []).map((m) =>
        isSavedChatMessage(m) && m.content.id === messageId ? ({ ...m, content: { ...m.content, deleted } } as Server.ChatMessage.Type) : m,
      ),
    })),
  addMessage: (message) =>
    set((state) => {
      const base =
        message.type === Server.MessageType.GAME_FINISHED
          ? (state.messages || []).filter((m) => m.type !== Server.MessageType.GAME_FINISHED)
          : state.messages || [];
      return { messages: [...base, message] };
    }),
  scrollToBottom: () => {},
  setScrollToBottom: (fn) => set({ scrollToBottom: fn }),
  scrollToFirstUnread: () => {},
  setScrollToFirstUnread: (fn) => set({ scrollToFirstUnread: fn }),
  focusInput: () => {},
  setFocusInput: (fn) => set({ focusInput: fn }),
  setLastReadAt: (timestamp) => set({ lastReadAt: timestamp }),
  setHasUnread: (value) => set({ hasUnread: value }),
  resetSession: () => set(initialSession),
  resetWorld: () => set(initialWorld),
}));
