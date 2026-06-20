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
  addMessage: (message: Server.ChatMessage.Type) => void;
  scrollToBottom: () => void;
  setScrollToBottom: (fn: () => void) => void;
  focusInput: (message?: string) => void;
  setFocusInput: (fn: () => void) => void;
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
  setMessages: (messages) => set({ messages }),
  setAnsweringTo: (id) => set({ answeringTo: id }),
  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages?.filter((m) => !isSavedChatMessage(m) || m.content.id !== messageId) || [],
    })),
  addMessage: (message) => set((state) => ({ messages: [...(state.messages || []), message] })),
  scrollToBottom: () => {},
  setScrollToBottom: (fn) => set({ scrollToBottom: fn }),
  focusInput: () => {},
  setFocusInput: (fn) => set({ focusInput: fn }),
  resetSession: () => set(initialSession),
  resetWorld: () => set(initialWorld),
}));
