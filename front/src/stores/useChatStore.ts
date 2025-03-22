import { create } from "zustand";
import { Message } from "../components/Chat/Chat";
import { defaultPlayer } from "./useGameStore";

interface ChatStore {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  answeringTo: string | null;
  setAnsweringTo: (id: string) => void;
  removeMessage: (messageId: string) => void;
  addMessage: (message: Message) => void;
  scrollToBottom: () => void;
  setScrollToBottom: (fn: () => void) => void;
  focusInput: () => void;
  setFocusInput: (fn: () => void) => void;
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
  answeringTo: null,
  setAnsweringTo: (id) => set({ answeringTo: id }),
  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages?.filter((m) => m.id !== messageId) || [],
    })),
  addMessage: (message) =>
    set((state) => ({ messages: [...(state.messages || []), message] })),
  scrollToBottom: () => {},
  setScrollToBottom: (fn) => set({ scrollToBottom: fn }),
  focusInput: () => {},
  setFocusInput: (fn) => set({ focusInput: fn }),
}));

export default useChatStore;
