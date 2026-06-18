import { Server } from '@surtom/interfaces';
import { create } from 'zustand';

export const defaultPlayer: Server.User = {
  name: '',
  isMobile: false,
  isLoggedIn: false,
  moderatorLevel: 0,
  xp: 0,
};

interface PlayerState {
  player: Server.User;
  setPlayer: (updatedPlayer: Partial<Server.User>) => void;
  setXP: (xp: number) => void;
}

const usePlayerStore = create<PlayerState>((set, get) => ({
  player: defaultPlayer,
  setPlayer: (updatedPlayer) =>
    set(() => ({
      player: { ...defaultPlayer, ...get().player, ...updatedPlayer },
    })),
  setXP: (xp) =>
    set((state) => ({
      player: { ...state.player, xp },
    })),
}));

export default usePlayerStore;
