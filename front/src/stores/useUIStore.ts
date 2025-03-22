import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type UIKeys =
  | "showTab"
  | "showStats"
  | "showCustomWord"
  | "showEndPage"
  | "showChat"
  | "showCustomRightClick";

interface UIState {
  showTab: boolean;
  showStats: boolean;
  showCustomWord: boolean;
  showEndPage: boolean;
  showChat: boolean;
  showCustomRightClick: boolean;
}

interface UIHandlers {
  toggle: (key: UIKeys) => void;
  setVisibility: (key: UIKeys, value: boolean) => void;
}

const useUIStore = create<
  UIState & UIHandlers & { isAnyInterfaceOpen: () => boolean }
>()(
  immer((set, get) => ({
    showTab: false,
    showStats: false,
    showCustomWord: false,
    showEndPage: false,
    showChat: false,
    showCustomRightClick: false,
    toggle: (key) =>
      set((state) => {
        state[key] = !state[key];
      }),
    setVisibility: (key, value) =>
      set((state) => {
        state[key] = value;
      }),
    isAnyInterfaceOpen: () => {
      const state = get();
      return (
        state.showTab ||
        state.showStats ||
        state.showCustomWord ||
        state.showEndPage ||
        state.showChat
      );
    },
  }))
);

export default useUIStore;
