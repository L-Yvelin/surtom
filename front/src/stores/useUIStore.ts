import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  visibility: Record<string, boolean>;
  setVisibility: (key: string, value: boolean) => void;
  toggle: (key: string) => void;
  closeAll: (except?: string[]) => void;
  resetSession: () => void;
}

const initialSession = {
  visibility: {} as Record<string, boolean>,
};

const useUIStore = create<UIState>()(
  immer((set) => ({
    ...initialSession,
    setVisibility: (key, value) =>
      set((state) => {
        state.visibility[key] = value;
      }),
    toggle: (key) =>
      set((state) => {
        state.visibility[key] = !state.visibility[key];
      }),
    closeAll: (except = []) =>
      set((state) => {
        for (const key of Object.keys(state.visibility)) {
          if (!except.includes(key)) state.visibility[key] = false;
        }
      }),
    resetSession: () =>
      set((state) => {
        state.visibility = {};
      }),
  })),
);

export const useVisibility = (key: string) => useUIStore((s) => !!s.visibility[key]);

export default useUIStore;
