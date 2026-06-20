import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { UIId } from '../ui/ids';

interface UIState {
  visibility: Partial<Record<UIId, boolean>>;
  setVisibility: (key: UIId, value: boolean) => void;
  toggle: (key: UIId) => void;
  closeAll: (except?: UIId[]) => void;
  resetSession: () => void;
}

const initialSession = {
  visibility: {} as Partial<Record<UIId, boolean>>,
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
        for (const key of Object.keys(state.visibility) as UIId[]) {
          if (!except.includes(key)) state.visibility[key] = false;
        }
      }),
    resetSession: () =>
      set((state) => {
        state.visibility = {};
      }),
  })),
);

export const useVisibility = (key: UIId) => useUIStore((s) => !!s.visibility[key]);

export default useUIStore;
