import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  visibility: Record<string, boolean>;
  setVisibility: (key: string, value: boolean) => void;
  toggle: (key: string) => void;
  closeAll: (except?: string[]) => void;
  isAnyInterfaceOpen: (except?: string[]) => boolean;
}

const useUIStore = create<UIState>()(
  immer((set, get) => ({
    visibility: {},
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
    isAnyInterfaceOpen: (except = []) => {
      const visibility = get().visibility;
      return Object.entries(visibility).some(([key, value]) => value && !except.includes(key));
    },
  })),
);

export const useVisibility = (key: string) => useUIStore((s) => !!s.visibility[key]);

export default useUIStore;
