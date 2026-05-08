import { useEffect } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ScopePolicy = 'block-all' | 'modal';

export interface InputScope {
  id: string;
  policy: ScopePolicy;
  onEscape?: () => void;
}

interface InputState {
  scopes: InputScope[];
  push: (scope: InputScope) => void;
  popById: (id: string) => void;
  top: () => InputScope | null;
  block: (id: string) => void;
  unblock: (id: string) => void;
  isBlocked: () => boolean;
  resetSession: () => void;
}

const initialSession = {
  scopes: [] as InputScope[],
};

const useInputStore = create<InputState>()(
  immer((set, get) => ({
    ...initialSession,
    push: (scope) =>
      set((state) => {
        state.scopes.push(scope);
      }),
    popById: (id) =>
      set((state) => {
        for (let i = state.scopes.length - 1; i >= 0; i--) {
          if (state.scopes[i].id === id) {
            state.scopes.splice(i, 1);
            return;
          }
        }
      }),
    top: () => {
      const { scopes } = get();
      return scopes.length === 0 ? null : scopes[scopes.length - 1];
    },
    block: (id) => {
      get().push({ id, policy: 'block-all' });
    },
    unblock: (id) => {
      get().popById(id);
    },
    isBlocked: () => get().top()?.policy === 'block-all',
    resetSession: () =>
      set((state) => {
        state.scopes = initialSession.scopes;
      }),
  })),
);

export const useIsInputBlocked = () => useInputStore((s) => s.scopes.length > 0 && s.scopes[s.scopes.length - 1].policy === 'block-all');

export const useBlockInput = (id: string, active: boolean) => {
  useEffect(() => {
    if (!active) return;
    useInputStore.getState().push({ id, policy: 'block-all' });
    return () => useInputStore.getState().popById(id);
  }, [id, active]);
};

export const useModalScope = (id: string, isOpen: boolean, onEscape?: () => void) => {
  useEffect(() => {
    if (!isOpen) return;
    useInputStore.getState().push({ id, policy: 'modal', onEscape });
    return () => useInputStore.getState().popById(id);
  }, [id, isOpen, onEscape]);
};

export default useInputStore;
