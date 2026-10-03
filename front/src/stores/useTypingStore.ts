import { create } from 'zustand';

export const TYPING_TTL_MS = 3000;
export const TYPING_SEND_INTERVAL_MS = 2000;

const timers = new Map<string, ReturnType<typeof setTimeout>>();

function clearTimer(name: string): void {
  const timer = timers.get(name);
  if (timer !== undefined) {
    clearTimeout(timer);
    timers.delete(name);
  }
}

interface TypingStore {
  typers: string[];
  markTyping: (name: string) => void;
  clearTyper: (name: string) => void;
  resetWorld: () => void;
}

export const useTypingStore = create<TypingStore>((set) => ({
  typers: [],
  markTyping: (name) => {
    clearTimer(name);
    timers.set(
      name,
      setTimeout(() => {
        timers.delete(name);
        set((state) => ({ typers: state.typers.filter((typer) => typer !== name) }));
      }, TYPING_TTL_MS),
    );
    set((state) => (state.typers.includes(name) ? state : { typers: [...state.typers, name] }));
  },
  clearTyper: (name) => {
    clearTimer(name);
    set((state) => (state.typers.includes(name) ? { typers: state.typers.filter((typer) => typer !== name) } : state));
  },
  resetWorld: () => {
    for (const name of [...timers.keys()]) clearTimer(name);
    set({ typers: [] });
  },
}));
