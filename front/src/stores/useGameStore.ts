import { AchievementProps } from '../components/AchievementsStack/Achievement/Achievement';
import { Tries, LetterState, Server, Word } from '@surtom/interfaces';
import { ScoreStats } from '../components/Stats/utils';
import { create } from 'zustand';

interface GameState {
  solution: string | undefined;
  setSolution: (solution: string) => void;
  validWords: string[];
  setValidWords: (validWords: string[]) => void;
  tries: Tries;
  setTries: (tries: Tries) => void;
  addTry: (word: Word) => void;
  letters: Word;
  gameFinished: () => boolean;
  setLetters: (letters: Word) => void;
  player: Server.User;
  setPlayer: (updatedPlayer: Partial<Server.User>) => void;
  playerList: Server.User[];
  setPlayerList: (players: Server.User[]) => void;
  addPlayer: (player: Server.User) => void;
  removePlayer: (playerName: string) => void;
  scores: ScoreStats;
  setScores: (scores: ScoreStats) => void;
  achievements: AchievementProps[];
  addAchievement: (achievement: AchievementProps) => void;
  removeAchievement: (achievementId: string) => void;
  hasLoaded: boolean;
  setHasLoaded: (hasLoaded: boolean) => void;
}

export const defaultPlayer: Server.User = {
  name: '',
  isMobile: false,
  isLoggedIn: false,
  moderatorLevel: 0,
  xp: 0,
};

const useGameStore = create<GameState>((set, get) => ({
  solution: undefined,
  setSolution: (solution) =>
    set(() => ({
      solution,
    })),
  validWords: [],
  setValidWords: (validWords) => set({ validWords }),
  tries: [],
  setTries: (tries) => set({ tries }),
  addTry: (word) => set((state) => ({ tries: [...(state.tries || []), word] })),
  letters: [],
  gameFinished: () => {
    const tries = get().tries;
    const lastTry = tries[tries.length - 1];
    return lastTry?.every((l) => l.state === LetterState.Correct) || false;
  },
  setLetters: (letters) => set({ letters }),
  player: defaultPlayer,
  setPlayer: (updatedPlayer) =>
    set((state) => ({
      player: {
        ...defaultPlayer,
        ...state.player,
        ...updatedPlayer,
      },
    })),
  playerList: [],
  setPlayerList: (players) => set({ playerList: players }),
  addPlayer: (player) => set((state) => ({ playerList: [...(state.playerList || []), player] })),
  removePlayer: (playerName) =>
    set((state) => ({
      playerList: state.playerList?.filter((p) => p.name !== playerName) || [],
    })),
  scores: {},
  setScores: (scores) => set({ scores }),
  achievements: [],
  addAchievement: (achievement) =>
    set((state) => ({
      achievements: [...(state.achievements || []), achievement].slice(-5),
    })),
  removeAchievement: (achievementId) =>
    set((state) => ({
      achievements: state.achievements?.filter((a) => a.id !== achievementId) || [],
    })),
  hasLoaded: false,
  setHasLoaded: (hasLoaded) => set({ hasLoaded }),
}));

export default useGameStore;
