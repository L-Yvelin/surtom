import { create } from 'zustand';
import { Server } from '@surtom/interfaces';

interface WorldsState {
  worlds: Server.WorldSummary[] | null;
  isFetching: boolean;
  error: string | null;
  setWorlds: (worlds: Server.WorldSummary[]) => void;
  setFetching: (fetching: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useWorldsStore = create<WorldsState>((set) => ({
  worlds: null,
  isFetching: false,
  error: null,
  setWorlds: (worlds) => set({ worlds, isFetching: false, error: null }),
  setFetching: (fetching) => set({ isFetching: fetching }),
  setError: (error) => set({ error, isFetching: false }),
  reset: () => set({ worlds: null, isFetching: false, error: null }),
}));
