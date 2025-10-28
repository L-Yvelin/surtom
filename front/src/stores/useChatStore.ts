import { create } from "zustand";
import { Server } from "../utils/Message";
import { defaultPlayer } from "./useGameStore";
import { isSavedChatMessage } from "../components/Chat/utils";

interface ChatStore {
  messages: Server.ChatMessage.Type[];
  setMessages: (messages: Server.ChatMessage.Type[]) => void;
  answeringTo: string | null;
  setAnsweringTo: (id: string) => void;
  removeMessage: (messageId: string) => void;
  addMessage: (message: Server.ChatMessage.Type) => void;
  scrollToBottom: () => void;
  setScrollToBottom: (fn: () => void) => void;
  focusInput: (message?: string) => void;
  setFocusInput: (fn: () => void) => void;
}

const defaultMessage: Server.ChatMessage.Type = {
  type: Server.MessageType.MAIL_ALL,
  content: {
    id: "1",
    user: defaultPlayer,
    text: "En cours de chargement",
    timestamp: new Date().toISOString(),
    deleted: 0,
  },
};

const useChatStore = create<ChatStore>((set) => ({
  messages: [defaultMessage],
  setMessages: (messages) => set({ messages }),
  answeringTo: null,
  setAnsweringTo: (id) => set({ answeringTo: id }),
  removeMessage: (messageId) =>
    set((state) => ({
      messages:
        state.messages?.filter(
          (m) => isSavedChatMessage(m) && m.content.id !== messageId,
        ) || [],
    })),
  addMessage: (message) =>
    set((state) => ({ messages: [...(state.messages || []), message] })),
  scrollToBottom: () => {},
  setScrollToBottom: (fn) => set({ scrollToBottom: fn }),
  focusInput: () => {},
  setFocusInput: (fn) => set({ focusInput: fn }),
}));

export default useChatStore;
