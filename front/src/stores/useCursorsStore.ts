import { create } from 'zustand';
import { Server } from '@surtom/interfaces';

interface CursorsStore {
  cursors: Server.CursorPositionMessage[];
  setCursors: (cursors: Server.CursorPositionMessage[]) => void;
  addOrUpdateCursor: (cursor: Server.CursorPositionMessage) => void;
  removeCursor: (userName: string) => void;
  resetWorld: () => void;
}

const initialWorld = {
  cursors: [] as Server.CursorPositionMessage[],
};

const useCursorsStore = create<CursorsStore>((set) => ({
  ...initialWorld,
  setCursors: (cursors) => set({ cursors }),
  addOrUpdateCursor: (cursor) =>
    set((state) => {
      const existingIndex = state.cursors.findIndex((c) => c.user.name === cursor.user.name);
      if (existingIndex !== -1) {
        const updatedCursors = [...state.cursors];
        updatedCursors[existingIndex] = cursor;
        return { cursors: updatedCursors };
      }
      return { cursors: [...state.cursors, cursor] };
    }),
  removeCursor: (userName) =>
    set((state) => ({
      cursors: state.cursors.filter((c) => c.user.name !== userName),
    })),
  resetWorld: () => set(initialWorld),
}));

export default useCursorsStore;
