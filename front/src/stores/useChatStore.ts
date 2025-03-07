import { create } from "zustand";
import { Message } from "../components/Chat/Chat";
import { defaultPlayer } from "./useGameStore";

interface ChatStore {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  removeMessage: (messageId: string) => void;
  addMessage: (message: Message) => void;
  scrollToBottom: (() => void) | null;
  setScrollToBottom: (fn: () => void) => void;
}

const defaultMessage: Message = {
  id: "",
  player: defaultPlayer,
  content: {
    text: "En cours de chargement",
  },
  type: "message",
};

const useChatStore = create<ChatStore>((set) => ({
  messages: [defaultMessage],
  setMessages: (messages) => set({ messages }),
  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages?.filter((m) => m.id !== messageId) || [],
    })),
  addMessage: (message) =>
    set((state) => ({ messages: [...(state.messages || []), message] })),
  scrollToBottom: null,
  setScrollToBottom: (fn) => set({ scrollToBottom: fn }),
}));

export default useChatStore;
